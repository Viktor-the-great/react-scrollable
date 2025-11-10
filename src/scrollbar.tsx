import {
  type ReactElement,
  type Ref,
  type HTMLAttributes,
  forwardRef,
  memo,
} from 'react';
import cx from './utils/classnames';
import makeClassName from './utils/makeClassName';
import type { ClassNamesType } from './types';
import './scrollbar.css';

type ScrollbarPropsType = HTMLAttributes<HTMLElement> & {
  isVertical?: boolean;
  classNames?: Partial<Pick<ClassNamesType, 'scrollbar' | 'thumb'>>
};

function Scrollbar({
  isVertical = false,
  className,
  classNames,
  ...props
}: ScrollbarPropsType, ref: Ref<HTMLDivElement>): ReactElement {
  const ariaLabel = isVertical
    ? 'vertical scrollbar'
    : 'horizontal scrollbar';

  const ariaOrientation = isVertical
    ? 'vertical'
    : 'horizontal';

  return (
    <div className={cx(
      'scrollable__scrollbar',
      {
        'scrollable__scrollbar_horizontal': !isVertical,
        'scrollable__scrollbar_vertical': isVertical,
        [`${className}__scrollbar`]: !!className,
      },
      makeClassName(classNames?.scrollbar, { isVertical }),
    )}
    >
      <div className={cx('scrollable__scrollbar__track', {
        [`${className}__scrollbar__track`]: !!className,
      })}>
        <div
          {...props}
          ref={ref}
          className={cx(
            'scrollable__scrollbar__thumb',
            {
              'scrollable__scrollbar__thumb_horizontal': !isVertical,
              'scrollable__scrollbar__thumb_vertical': isVertical,
              [`${className}__scrollbar__thumb`]: !!className,
            },
            makeClassName(classNames?.thumb, { isVertical }),
          )}
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