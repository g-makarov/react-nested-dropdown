import clsx from 'clsx';
import React, {
  ReactElement,
  ReactNode,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useClickAway } from '~/utils/use-click-away';

export interface DropdownItem<TValue = undefined> {
  label: string;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  items?: DropdownItem<TValue>[];
  value?: TValue;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownProps<TValue> {
  items: DropdownItem<TValue>[];
  containerWidth?: number | string;
  onSelect?: (value: TValue, option: DropdownItem<TValue>) => void;
  children: (params: { onClick: () => void; isOpen: boolean }) => ReactElement;
  className?: string;
  renderOption?: (option: DropdownItem<TValue>) => ReactNode;
  closeOnScroll?: boolean;
}

export const Dropdown = <TValue,>({
  items,
  containerWidth,
  onSelect,
  children,
  className,
  renderOption,
  closeOnScroll = true,
}: DropdownProps<TValue>): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [dropdownIsOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = useCallback(() => setDropdownOpen(state => !state), []);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const childrenProps = useMemo(() => {
    return {
      isOpen: dropdownIsOpen,
      onClick: toggleDropdown,
    };
  }, [dropdownIsOpen, toggleDropdown]);

  const handleSelect = React.useCallback(
    (item: DropdownItem<TValue>) => {
      if (item.disabled) {
        return;
      }

      if (item.onSelect) {
        item.onSelect();
      } else if (item.value !== undefined && onSelect) {
        onSelect(item.value, item);
      }
      closeDropdown();
    },
    [closeDropdown, onSelect],
  );

  useClickAway(containerRef, closeDropdown);

  const scrollListener = React.useCallback(
    (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el?.classList?.contains('rnd__menu')) {
        closeDropdown();
      }
    },
    [closeDropdown],
  );

  useEffect(() => {
    if (dropdownIsOpen && closeOnScroll) {
      document.addEventListener('scroll', scrollListener, true);
    }
    return () => {
      document.removeEventListener('scroll', scrollListener, true);
    };
  }, [dropdownIsOpen]);

  const rootMenuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (dropdownIsOpen && rootMenuRef.current) {
      const rect = rootMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        rootMenuRef.current.style.bottom = '100%';
      }
    }
  }, [dropdownIsOpen]);

  return (
    <div className={clsx('rnd', className)} ref={containerRef}>
      {children(childrenProps)}
      {dropdownIsOpen && (
        <ul
          className="rnd__root-menu rnd__menu"
          style={{ width: containerWidth }}
          ref={rootMenuRef}
        >
          {items.map((item, index) => (
            <Option key={index} option={item} onSelect={handleSelect} renderOption={renderOption} />
          ))}
        </ul>
      )}
    </div>
  );
};

interface OptionProps<TValue> {
  option: DropdownItem<TValue>;
  onSelect: (item: DropdownItem<TValue>) => void;
  renderOption?: (option: DropdownItem<TValue>) => React.ReactNode;
}

const Option = <TValue,>({
  option,
  onSelect,
  renderOption,
}: OptionProps<TValue>): React.ReactElement => {
  const items = option.items;
  const hasSubmenu = !!items;

  const handleClick = React.useCallback(
    (e: UIEvent) => {
      if (hasSubmenu) return;

      e.stopPropagation();
      onSelect(option);
    },
    [hasSubmenu, onSelect, option],
  );

  const submenuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const submenuElement = submenuRef.current;

    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const isHTMLElement = entry.target instanceof HTMLElement;
        if (isHTMLElement) {
          const rect = entry.target.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            entry.target.style.top = 'auto';
            entry.target.style.bottom = '0';
          }
        }
      });
    });

    if (submenuElement) {
      observer.observe(submenuElement);
    }

    return () => {
      if (submenuElement) {
        observer.unobserve(submenuElement);
      }
    };
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      className={clsx('rnd__option', option.className, {
        'rnd__option--disabled': option.disabled,
        'rnd__option--with-menu': hasSubmenu,
      })}
      onMouseDown={handleClick}
      onKeyUp={handleClick}
    >
      {hasSubmenu && (
        <ul className="rnd__menu rnd__submenu" ref={submenuRef}>
          {items.map((item, index) => (
            <Option key={index} option={item} onSelect={onSelect} renderOption={renderOption} />
          ))}
        </ul>
      )}
      {renderOption && renderOption(option)}
      {!renderOption && (
        <>
          {option.iconBefore && <div>{option.iconBefore}</div>}
          <p className="rnd__option-label">{option.label}</p>
          {hasSubmenu && (
            <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
              <path d="M28 34 18 24l10-10Z" />
            </svg>
          )}
          {option.iconAfter && <div className="ml-auto">{option.iconAfter}</div>}
        </>
      )}
    </li>
  );
};