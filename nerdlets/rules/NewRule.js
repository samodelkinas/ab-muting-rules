import React from "react";
import {
  Button,
  Icon,
  NerdGraphQuery,
  NerdGraphMutation,
  InlineMessage,
  Spinner,
  BlockText,
} from "nr1";

const accountId = 3112341;
const batchLimit = 500;
const additionalTimezones = [
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Vilnius",
];

export default class NewRule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.state = {
      newRuleName: null,
      newRuleCreated: false,
      newRuleCR: null,
      newRuleStartTime: null,
      newRuleEndTime: null,
      uploadedFileContent: null,
      newRuleTimeZone: null,
      defaultTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      errorMessage: null,
    };
    this.createNewRule = this.createNewRule.bind(this);
    this.clearRule = this.clearRule.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.newRuleStartTimeInput = React.createRef();
    this.newRuleEndTimeInput = React.createRef();
    
  }

  handleFileUpload(e) {
    var uploadedFile = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = (d) => {
      this.setState({ uploadedFileContent: d.target.result });
    };
    fileReader.readAsText(uploadedFile, "UTF-8");
  }

  splitBatches(arr) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += batchLimit)
      R.push(arr.slice(i, i + batchLimit));
    return R;
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
    console.log(this.state);
  }

  validateNotNullOrEmpty(content, message) {
    if (content == null || content == "") {
      this.setState({ errorMessage: message });
      return false;
    } else {
      return true;
    }
  }

  createNewRule(event) {
    console.log(this.newRuleStartTimeInput.current.value)
    if (
      !this.validateNotNullOrEmpty(
        this.state.uploadedFileContent,
        "Entity list is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.state.newRuleName,
        "Rule name is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.state.newRuleCR,
        "Valid change record is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.newRuleStartTimeInput.current.value,
        "Valid start time is required"
      )
    )
      return;
    if (
      !this.validateNotNullOrEmpty(
        this.newRuleEndTimeInput.current.value,
        "Valid end time is required"
      )
    )
      return;
    const hostList = this.state.uploadedFileContent.split(/\r?\n/);
    console.log(hostList.length);
    if (hostList.length > batchLimit) {
      var exceedsBatch = true;
    } else {
      var exceedsBatch = false;
    }
    const batchedList = this.splitBatches(hostList);
    console.log(batchedList);

    batchedList.map((b, index) => {
      const batch = JSON.stringify(b);
      const mutateQuery = `
        mutation {
          alertsMutingRuleCreate(
            accountId: ${accountId}
            rule: {
              name: "${
                hostList.length > batchLimit
                  ? this.state.newRuleName +
                    " - batch " +
                    (index + 1).toString()
                  : this.state.newRuleName
              }"
              description: "${this.state.newRuleCR}"
              enabled: true
              condition: {
                operator: OR
                conditions: [
                  { attribute: "tag.hostname", operator: IN, values: ${batch} },
                  { attribute: "tag.windowsService.hostname", operator: IN, values: ${batch} },
                  { attribute: "targetName", operator: IN, values: ${batch} },
                ]
              }
              schedule: {
                endTime: "${this.newRuleEndTimeInput.current.value + ":00"}"
                startTime: "${this.newRuleStartTimeInput.current.value + ":00"}"
                timeZone: "${
                  this.state.newRuleTimeZone == null
                    ? this.state.defaultTimeZone
                    : this.state.newRuleStartTime
                }"
              }
            }
          ) {
            id
          }
        }
        `;
        console.log(mutateQuery)
      this.setState({ errorMessage: null });
      this.setState({ isLoading: true });
      NerdGraphMutation.mutate({
        mutation: mutateQuery,
      }).catch((error) => {
        console.log("Nerdgraph Error:", error);
        this.setState({ errorMessage: error });
      });
      this.setState({
        newRuleCreated: true,
        isLoading: false,
      });
    });
  }

  clearRule() {
    this.setState({
      errorMessage: null,
      newRuleCreated: false,
      newRuleName: "",
      newRuleCR: "",
      uploadedFileContent: null,
      
    });
    this.newRuleStartTimeInput.current.value = ""
    this.newRuleEndTimeInput.current.value = ""
  }

  render() {
    const mb = {
      marginBottom: "10px",
      marginTop: "10px",
    };
    if (this.state.isLoading) return <Spinner />;
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
        {this.state.newRuleCreated ? (
          <InlineMessage label="New rule created"></InlineMessage>
        ) : (
          ""
        )}
        <table>
          <tr>
            <td>Rule Name</td>
            <td>
              <input
                type="text"
                value={this.state.newRuleName}
                name="newRuleName"
                onChange={this.handleInputChange}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Description</td>
            <td>
              <input
                type="text"
                value={this.state.newRuleCR}
                name="newRuleCR"
                onChange={this.handleInputChange}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Start Time</td>
            <td>
            <input
                name="newRuleStartTime"
                type="datetime-local"
                ref={this.newRuleStartTimeInput}
              ></input>
            </td>
          </tr>
          <tr>
            <td>End Time</td>
            <td>
              <input
                name="newRuleEndTime"
                type="datetime-local"
                ref={this.newRuleEndTimeInput}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Time Zone</td>
            <td>
              <select
                onChange={this.handleInputChange}
                name="newRuleTimeZone"
                id="newRuleTimeZone"
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
                name="newRuleValues"
                value={
                  this.state.uploadedFileContent != null
                    ? this.state.uploadedFileContent
                    : ""
                }
              ></textarea>
              <input
                type="file"
                onChange={(e) => this.handleFileUpload(e)}
              ></input>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <Button type={Button.TYPE.OUTLINE} onClick={this.createNewRule}>
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
