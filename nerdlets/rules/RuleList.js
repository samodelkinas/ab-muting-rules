import React from "react";
import { Button, Icon, NerdGraphQuery, Modal } from "nr1";
import RuleDetails from "./RuleDetails";
const accountId = 3112341;
export default class RuleList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRuleId: null,
      ruleDetailsHidden: true,
      ruleDetails: null,
    };
    this.openRuleDetails = this.openRuleDetails.bind(this);
    this.closeRuleDetails = this.closeRuleDetails.bind(this);
  }

  openRuleDetails(ruleId) {
    const detailsQuery = `
    {
      actor {
        account(id: ${accountId}) {
          alerts {
            mutingRule(id: ${ruleId}) {
              id
              createdByUser {
                name
              }
              schedule {
                endTime
                startTime
                timeZone
              }
              name
              status
              description
              condition {
                conditions {
                  attribute
                  operator
                  values
                }
              }
            }
          }
        }
      }
    }`;

    const queryResults = NerdGraphQuery.query({ query: detailsQuery });
    queryResults
      .then((results) => {
        const ruleDetails = results.data.actor.account.alerts.mutingRule;
        this.setState({ ruleDetails: ruleDetails });
      })
      .catch((error) => {
        console.log("Nerdgraph Error:", error);
      });
    this.setState({ selectedRuleId: ruleId });
    this.setState({ ruleDetailsHidden: false });
  }

  closeRuleDetails() {
    this.setState({ ruleDetailsHidden: true, ruleDetails: null });
  }

  render() {
    if (this.props.ruleData != null) {
      return (
        <div>
          <table className="table">
            <thead>
              <th>&nbsp;</th>
              <th>Name</th>
              <th>Description</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Created by</th>
              <th>Status</th>
            </thead>
            <tbody></tbody>
            {this.props.ruleData
              .filter((rules) => {
                if (this.props.ruleName === "") {
                  return rules;
                } else if (
                  rules.name
                    .toLowerCase()
                    .includes(this.props.ruleName.toLowerCase())
                ) {
                  return rules;
                }
              })
              .reverse((rules) => rules.id)
              .map((d) => (
                <tr key={d.id}>
                  <td>
                    <Button
                      type={Button.TYPE.OUTLINE}
                      onClick={() => this.openRuleDetails(d.id)}
                    >
                      <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__SHOW}></Icon>
                    </Button>
                  </td>
                  <td>{d.name}</td>
                  <td>{d.description}</td>
                  <td>{d.schedule != null ? d.schedule.startTime : "-"}</td>
                  <td>{d.schedule != null ? d.schedule.endTime : "-"}</td>
                  <td>{d.createdByUser.name}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
          </table>
          <Modal
            name="ruleDetails"
            hidden={this.state.ruleDetailsHidden}
            onClose={() => this.closeRuleDetails()}
          >
            <div>
              <RuleDetails
                ruleId={this.state.selectedRuleId}
                ruleDetails={this.state.ruleDetails}
              />
            </div>
          </Modal>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}
