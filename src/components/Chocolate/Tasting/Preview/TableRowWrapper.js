import React from 'react';

/*
 *  TableRowWrapper
 *
 *  tableRowClass   - prop for class name to auto-add
 *  tastingType     - String type of tasting
 *  tableData       - All rendered table data
 */
class TableRowWrapper extends React.Component {

  render() {
    let className = this.props.tableRowClass + " " + this.props.tastingType;
    if (!this.props.showAnswers) {
      className += " hidden";
    }
    return (
      <tr className={className}>
        {this.props.tableData}
      </tr>
    );
  }
}

export default TableRowWrapper;
