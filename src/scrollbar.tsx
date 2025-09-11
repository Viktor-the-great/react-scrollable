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
  className,
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
      [`${className}__scrollbar`]: !!className,
    })}>
      <div className={cx('scrollable__scrollbar__track', {
        [`${className}__scrollbar__track`]: !!className,
      })}>
        <div
          {...props}
          ref={ref}
          className={cx('scrollable__scrollbar__thumb', {
            [`${className}__scrollbar__thumb`]: !!className,
          })}
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