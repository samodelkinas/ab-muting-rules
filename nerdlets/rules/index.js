import React from "react";
import { Button, Icon, NerdGraphQuery, Spinner, Modal, TextField } from "nr1";
import RuleList from "./RuleList";
import NewRule from "./NewRule";

/// todo use account selector
const accountId = 3112341;

export default class AbMutingApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ruleName: "",
      ruleData: null,
      newRuleHidden: true,
    };
    this.closeNewRule = this.closeNewRule.bind(this);
    this.openNewRule = this.openNewRule.bind(this);
  }

  componentDidMount() {
    const nrQuery = `
    {
         actor {
           account(id: ${accountId}) {
             alerts {
               mutingRules {
                 name
                 description
                 schedule {
                   endTime
                   startTime
                 }
                 createdByUser {
                   name
                 }
                 status
                 id
               }
             }
           }
         }
       }`;
    const nrQueryResult = NerdGraphQuery.query({ query: nrQuery });
    nrQueryResult
      .then((results) => {
        this.setState({
          ruleData: results.data.actor.account.alerts.mutingRules,
        });
      })
      .catch((error) => {
        console.log("Nerdgraph Error:", error);
      });
  }

  closeNewRule() {
    this.setState({ newRuleHidden: true });
    
  }

  openNewRule() {
    this.setState({ newRuleHidden: false });
  }

  render() {
    if (this.state.ruleData == null) {
      return <Spinner />;
    }
    return (
      <div>
        <TextField type={TextField.TYPE.SEARCH} name="ruleName" placeholder="Rule name" onChange={(e) => this.setState({ ruleName: e.target.value })}/>
        &nbsp;
        <Button type={Button.TYPE.OUTLINE} onClick={() => this.openNewRule()}>
          <Icon type={Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}></Icon>
          New rule
        </Button>
        &nbsp;
        <Button type={Button.TYPE.OUTLINE} onClick={() => location.reload()}>
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__UNDO}></Icon>
          Reload
        </Button>
        <Modal
          name="newRule"
          hidden={this.state.newRuleHidden}
          onClose={() => this.closeNewRule()}
        >
          <NewRule newRule={true} />
        </Modal>
        <RuleList
          ruleName={this.state.ruleName}
          ruleData={this.state.ruleData}
        />
      </div>
    );
  }
}
