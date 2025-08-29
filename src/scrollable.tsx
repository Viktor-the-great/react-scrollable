import { type ReactNode, memo } from 'react';
import './scrollable.css';

export type ScrollablePropsType = {
  showThumbOnHover?: boolean;
}

function Scrollable({
  showThumbOnHover
}: ScrollablePropsType): ReactNode {
  return (
    <div className="scrollable">
      {showThumbOnHover ? 'show on hover' : 'always showing'}
    </div>
  );
}

export default memo(Scrollable)