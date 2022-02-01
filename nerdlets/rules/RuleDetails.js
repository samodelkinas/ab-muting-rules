import React from "react";
import { Button, Icon, Spinner, NerdGraphMutation, InlineMessage } from "nr1";
import moment from "moment";

const accountId = 3112341;
const additionalTimezones = [
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Vilnius",
];
export default class RuleDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      defaultTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      errorMessage: null,
      ruleUpdated: false
    };
    this.updateRule = this.updateRule.bind(this);
    this.clearRule = this.clearRule.bind(this);
    this.ruleName = React.createRef();
    this.ruleDescription = React.createRef();
    this.ruleStartTime = React.createRef();
    this.ruleEndTime = React.createRef();
    this.ruleTimeZone = React.createRef();
    this.ruleHostList = React.createRef();
  }

  validateNotNullOrEmpty(content, message) {
    if (content == null || content == "") {
      this.setState({ errorMessage: message });
      return false;
    } else {
      return true;
    }
  }

  clearRule() {
    this.setState({
      errorMessage: null,
      ruleUpdated: false,
    });
    this.ruleName.current.value = "";
    this.ruleDescription.current.value = "";
    this.ruleStartTime.current.value = "";
    this.ruleEndTime.current.value = "";
    this.ruleHostList.current.value = "";
  }

  setDateFormatForDisplay(inputDate) {
    return moment(Date.parse(inputDate)).format('YYYY-MM-DDThh:mm')
  }

  setDateFormatForSubmit(inputDate) {
    return moment(Date.parse(inputDate)).format('YYYY-MM-DDThh:mm:ss')
  }

  updateRule(event) {
    if (
      !this.validateNotNullOrEmpty(
        this.ruleHostList.current.value,
        "Entity list is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.ruleName.current.value,
        "Rule name is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.ruleDescription.current.value,
        "Valid change record is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.ruleStartTime.current.value,
        "Valid start time is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.ruleEndTime.current.value,
        "Valid end time is required"
      )
    )
      return;
    const hostList = JSON.stringify(this.ruleHostList.current.value.split(/\r?\n/))
    const mutateQuery = `
        mutation {
          alertsMutingRuleUpdate(
            id: ${this.props.ruleDetails.id}
            accountId: ${accountId}
            rule: {
              name: "${this.ruleName.current.value}"
              description: "${this.ruleDescription.current.value}"
              enabled: true
              condition: {
                operator: OR
                conditions: [
                  { attribute: "tag.hostname", operator: IN, values: ${hostList} },
                  { attribute: "tag.windowsService.hostname", operator: IN, values: ${hostList} },
                  { attribute: "targetName", operator: IN, values: ${hostList} },
                ]
              }
              schedule: {
                startTime: "${this.setDateFormatForSubmit(this.ruleStartTime.current.value)}"
                endTime: "${this.setDateFormatForSubmit(this.ruleEndTime.current.value)}"
                timeZone: "${
                  this.ruleTimeZone.current.value == null
                    ? this.state.defaultTimeZone
                    : this.ruleTimeZone.current.value
                }"
              }
            }
          ) {
            id
          }
        }
        `;
    console.log(mutateQuery);
    this.setState({ errorMessage: null });
    NerdGraphMutation.mutate({
      mutation: mutateQuery,
    }).catch((error) => {
      console.log("Nerdgraph Error:", error);
      this.setState({ errorMessage: error });
    });
    this.setState({
      ruleUpdated: true
    });
  }

  render() {
    if (this.props.ruleDetails == null) return <Spinner />;
    return (
      <div>
         {this.state.errorMessage != null ? (
          <InlineMessage
            label={this.state.errorMessage}
            type={InlineMessage.TYPE.WARNING}
          ></InlineMessage>
        ) : (
          ""
        )}
        {this.state.ruleUpdated ? (
          <InlineMessage label="Rule updated"></InlineMessage>
        ) : (
          ""
        )}
        <h3>Edit rule</h3>
        <table>
          <tr>
            <td>Name</td>
            <td>
              <input
                type="text"
                defaultValue={this.props.ruleDetails.name}
                name="ruleName"
                ref={this.ruleName}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Description</td>
            <td>
              <input
                type="text"
                defaultValue={this.props.ruleDetails.description}
                name="ruleDescription"
                ref={this.ruleDescription}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Start Time</td>
            <td>
              <input
                name="ruleStartTime"
                type="datetime-local"
                defaultValue={
                  this.setDateFormatForDisplay(this.props.ruleDetails.schedule.startTime)
                }
                ref={this.ruleStartTime}
              ></input>
            </td>
          </tr>
          <tr>
            <td>End Time</td>
            <td>
              <input
                name="endTime"
                type="datetime-local"
                defaultValue={
                  this.setDateFormatForDisplay(this.props.ruleDetails.schedule.endTime)
                }
                ref={this.ruleEndTime}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Time Zone</td>
            <td>
              <select
                defaultValue={this.props.ruleDetails.schedule.timeZone}
                name="timeZone"
                ref={this.ruleTimeZone}
                id="timeZone"
              >
                <option value={this.state.defaultTimeZone}>
                  {this.state.defaultTimeZone + " (detected)"}
                </option>
                {additionalTimezones.map((tz) =>
                  tz != this.state.defaultTimeZone ? (
                    <option value={tz}>{tz}</option>
                  ) : (
                    ""
                  )
                )}
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <textarea
                rows="20"
                placeholder="hosts"
                name="hosts"
                defaultValue={this.props.ruleDetails.condition.conditions[0].values.join(
                  "\r\n"
                )}
                ref={this.ruleHostList}
              ></textarea>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <Button type={Button.TYPE.OUTLINE} onClick={this.updateRule}>
                <Icon type={Icon.TYPE.INTERFACE__SIGN__CHECKMARK}></Icon>
                &nbsp;Submit
              </Button>
              &nbsp;
              <Button type={Button.TYPE.OUTLINE} onClick={this.clearRule}>
                <Icon
                  type={Icon.TYPE.INTERFACE__SIGN__TIMES__V_ALTERNATE}
                ></Icon>
                &nbsp;Clear
              </Button>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}
