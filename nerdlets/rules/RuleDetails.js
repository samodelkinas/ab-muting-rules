import React from "react";
import {
  Spinner,
} from "nr1";

const accountId = 3112341;

export default class RuleDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  render() {
    if (this.props.ruleDetails == null) return <Spinner />;
    return (
      <div>
        <h2>{this.props.ruleDetails.name}</h2>
        <table>
          <tr>
            <td>Description:</td>
            <td>{this.props.ruleDetails.description}</td>
          </tr>
          <tr>
            <td>Created by:</td>
            <td>{this.props.ruleDetails.createdByUser.name}</td>
          </tr>
          <tr>
            <td>Start time:</td>
            <td>{this.props.ruleDetails.schedule.startTime}</td>
          </tr>
          <tr>
            <td>End time:</td>
            <td>{this.props.ruleDetails.schedule.endTime}</td>
          </tr>
          <tr>
            <td>Timezone:</td>
            <td>{this.props.ruleDetails.schedule.timeZone}</td>
          </tr>
        </table>
        <div>
          {this.props.ruleDetails.condition.conditions.map((d) => (
            <div>
              <h3>
                {d.attribute} {d.operator}:
              </h3>
              {d.values.map((v) => (
                <p>{v}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
