const OperationCounter = ({ count }) => (
  <div className="operation_count">
    <div className="operation-count__title">操作步数：</div>
    <div className="operation-count__value">{count}</div>
  </div>
);

export default OperationCounter;
