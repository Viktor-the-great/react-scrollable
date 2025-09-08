import {
  type ReactElement,
  type Ref,
  type HTMLAttributes,
  forwardRef,
  memo,
} from 'react';
import cx from './utils/classnames';
import './scrollbar.css';

type ScrollbarPropsType = HTMLAttributes<HTMLElement> & {
  isVertical?: boolean;
};

function Scrollbar({
  isVertical = false,
  ...props
}: ScrollbarPropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const ariaLabel = isVertical
    ? 'vertical scrollbar'
    : 'horizontal scrollbar';

  const ariaOrientation = isVertical
    ? 'vertical'
    : 'horizontal';

  return (
    <div className={cx('scrollable__scrollbar', {
      'scrollable__scrollbar_horizontal': !isVertical,
      'scrollable__scrollbar_vertical': isVertical,
    })}>
      <div className="scrollable__scrollbar__track">
        <div
          {...props}
          ref={ref}
          className="scrollable__scrollbar__thumb"
          role="scrollbar"
          aria-orientation={ariaOrientation}
          aria-label={ariaLabel}
          aria-valuenow={0}
          aria-hidden={true}
        />
      </div>
    </div>
  );
}

export default memo(forwardRef<
  HTMLDivElement,
  ScrollbarPropsType
>(Scrollbar));