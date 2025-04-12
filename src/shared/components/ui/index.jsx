// src/shared/components/ui/index.jsx
import React from 'react';
import Modal from './modal/Modal';
import { Row, Col } from './grid/Grid';
export { default as Tooltip } from './tooltip/Tooltip';
export { default as Progress } from './progress/Progress';

export { Modal, Row, Col };
/**
 * Group: 여러 컴포넌트를 그룹화하는 컨테이너
 * - direction: 'horizontal' | 'vertical' (default: 'vertical')
 * - spacing: 'sm' | 'md' | 'lg' (default: 'md')
 */
export const Group = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  className = '',
}) => {
  const baseStyles = 'w-full';
  const spacingStyles = {
    sm: direction === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: direction === 'horizontal' ? 'space-x-4' : 'space-y-4',
    lg: direction === 'horizontal' ? 'space-x-6' : 'space-y-6',
  };
  const directionStyles =
    direction === 'horizontal'
      ? 'flex items-start' // items-start로 변경하여 상단 정렬
      : '';

  return (
    <div
      className={`${baseStyles} ${directionStyles} ${spacingStyles[spacing]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Form: 전체 폼을 감싸는 컨테이너
 * - maxWidth: 폼의 최대 너비 (default: '2xl')
 */
export const Form = ({ children, maxWidth = '2xl', className = '' }) => {
  return (
    <form
      className={`w-full max-w-${maxWidth} mx-auto px-6 py-8 space-y-6 ${className}`}
    >
      {children}
    </form>
  );
};

/**
 * FormItem: 라벨과 입력 필드를 포함하는 개별 폼 아이템
 */
// export const FormItem = ({ children, fullWidth, className = '' }) => {
//   const widthClass = fullWidth ? 'col-span-2' : '';
//   return (
//     <div
//       className={`grid grid-cols-[80px,1fr] gap-4 items-center ${widthClass} ${className}`}
//     >
//       {children}
//     </div>
//   );
// };
export const FormItem = ({
  children,
  fullWidth = false,
  direction = 'horizontal',
  className = '',
}) => {
  const directionStyles =
    direction === 'horizontal'
      ? 'grid grid-cols-[80px,1fr] gap-4 items-center'
      : 'flex flex-col gap-2';
  const widthClass = fullWidth ? 'col-span-2' : '';

  // baseStyles에서 w-full 제거하여 className으로 너비 제어 가능하도록 수정
  const baseStyles = '';

  return (
    <div
      className={`${baseStyles} ${directionStyles} ${widthClass} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Label: 입력 필드의 라벨
 * - required: 필수 입력 여부
 */
export const Label = ({ children, required, className = '' }) => {
  return (
    <label
      className={`text-sm font-medium text-gray-700 whitespace-nowrap ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

/**
 * Input: 텍스트 입력 필드
 * - type: input type (text, number, etc.)
 * - error: 에러 상태
 */
export const Input = React.forwardRef(
  ({ type = 'text', error, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full h-9 px-3 py-2 text-sm border rounded-md transition-colors';
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <input
        ref={ref}
        type={type}
        className={`${baseStyles} ${stateStyles} ${className}
        disabled:bg-gray-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        {...props}
      />
    );
  },
);

/**
 * Select: 드롭다운 선택 컴포넌트
 */
{
  /* shared/components/ui/index.jsx의 Select 컴포넌트 수정 */
}
export const Select = React.forwardRef(
  ({ error, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full h-9 px-3 py-2 text-sm border rounded-md transition-colors appearance-none';
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <div className="relative space-y-1">
        <div className="relative">
          <select
            ref={ref}
            className={`${baseStyles} ${stateStyles} ${className}
            disabled:bg-gray-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            bg-none`}
            {...props}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              className={`h-4 w-4 ${error ? 'text-red-500' : 'text-gray-400'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <Message type="error">{error}</Message>}
      </div>
    );
  },
);

/**
 * TextArea: 여러 줄 텍스트 입력 필드
 */
export const TextArea = React.forwardRef(
  ({ error, className = '', rows = 4, autoHeight = false, ...props }, ref) => {
    // 높이 관련 스타일 결정
    const heightStyles = autoHeight ? 'min-h-[100px]' : '';

    const baseStyles = `w-full px-3 py-2 text-sm border rounded-md transition-colors ${heightStyles}`;
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`${baseStyles} ${stateStyles} ${className}
        disabled:bg-gray-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        {...props}
      />
    );
  },
);

/**
 * Button: 버튼 컴포넌트
 * - variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Switch: 토글 스위치 컴포넌트
 */
export const Switch = ({ checked, onChange, disabled, className = '' }) => {
  return (
    <button
      type="button"
      className={`${checked ? 'bg-blue-600' : 'bg-gray-200'}
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
        transition-colors duration-200 ease-in-out
        disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      onClick={onChange}
    >
      <span
        className={`${checked ? 'translate-x-6' : 'translate-x-1'}
          pointer-events-none inline-block h-4 w-4 transform rounded-full 
          bg-white shadow ring-0 transition duration-200 ease-in-out
          my-1`}
      />
    </button>
  );
};

/**
 * Message: 알림 메시지 컴포넌트
 * - type: 'error' | 'success' | 'info' | 'warning' (default: 'info')
 */
export const Message = ({ children, type = 'info', className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-500',
    success: 'bg-green-50 text-green-700 border-green-500',
    info: 'bg-blue-50 text-blue-700 border-blue-500',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-500',
  };

  return (
    <div
      className={`px-4 py-2 text-sm rounded-md border-l-4 ${styles[type]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Checkbox: 체크박스 컴포넌트
 */
export const Checkbox = React.forwardRef(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 
        focus:ring-blue-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  },
);

/**
 * Stack: 여러 컴포넌트를 수평/수직으로 배치하는 컨테이너
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @param {'horizontal'|'vertical'} [props.direction='horizontal'] - 배치 방향
 * @param {string} [props.ratio] - 자식 컴포넌트들의 비율 (예: "1:2")
 * @param {'start'|'center'|'end'} [props.align='center'] - 교차축 정렬
 * @param {'sm'|'md'|'lg'} [props.spacing='md'] - 컴포넌트 간 간격
 */
export const Stack = ({
  children,
  direction = 'horizontal',
  ratio,
  equal = true,
  align = 'center',
  spacing = 'md',
  className = '',
}) => {
  const baseStyles = 'flex';
  const directionStyles = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  }[align];
  const spacingStyles = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[spacing];

  const controls = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    if (ratio) {
      const ratios = ratio.split(':').map(Number);
      const total = ratios.reduce((a, b) => a + b, 0);
      const width = `w-${ratios[index]}/${total}`;
      return React.cloneElement(child, {
        className: `${child.props.className || ''} ${width}`.trim(),
      });
    }

    // FormItem인 경우 flex-1 적용
    if (child.type === FormItem) {
      return React.cloneElement(child, {
        className: `${child.props.className || ''} flex-1`.trim(),
      });
    }

    // 그 외의 경우 equal prop에 따라 처리
    if (equal) {
      return React.cloneElement(child, {
        className: `${child.props.className || ''} flex-1`.trim(),
      });
    }

    return child;
  });

  return (
    <div
      className={`${baseStyles} ${directionStyles} ${alignStyles} ${spacingStyles} ${className}`}
    >
      {controls}
    </div>
  );
};

/**
 * Description: 상세 정보를 보여주기 위한 컨테이너 컴포넌트
 */
export const Description = ({ children, className = '' }) => {
  return (
    <div className={`w-full border border-gray-200 rounded-md ${className}`}>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  );
};

/**
 * DescriptionRow: Description 내부의 행을 나타내는 컴포넌트
 * @param {Object} props
 * @param {ReactNode} props.children - 자식 컴포넌트
 * @param {boolean} [props.double] - 2칸 구조 여부 (기본: 4칸 구조)
 * @param {boolean} [props.equalItems] - label이 아닌 항목들 균등 배분 여부
 * @param {string} [props.className] - 추가 스타일 클래스
 */
export const DescriptionRow = ({
  children,
  double = false,
  equalItems = false,
  className = '',
}) => {
  const baseStyles = 'flex items-stretch';
  const layoutStyles = double ? 'gap-2' : 'gap-2';

  const modifiedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // label이 아니고 width나 grow가 지정되지 않은 경우만 flex-1 적용
      if (
        equalItems &&
        !child.props.label &&
        !child.props.width &&
        !child.props.grow
      ) {
        return React.cloneElement(child, {
          className: `${child.props.className || ''} flex-1`.trim(),
        });
      }
    }
    return child;
  });

  return (
    <div className={`${baseStyles} ${layoutStyles} ${className}`}>
      {modifiedChildren}
    </div>
  );
};

/**
 * DescriptionItem: Description 내부의 레이블 또는 값을 표시하는 컴포넌트
 * @param {Object} props
 * @param {ReactNode} props.children - 표시할 내용
 * @param {boolean} [props.label] - 레이블 여부
 * @param {string} [props.width] - 너비 클래스 (예: 'w-[120px]', 'w-1/4' 등)
 * @param {boolean} [props.grow] - flex-grow 적용 여부
 * @param {string} [props.className] - 추가 스타일 클래스
 */
export const DescriptionItem = ({
  children,
  label = false,
  width,
  grow = false,
  className = '',
}) => {
  const baseStyles = 'px-4 py-3 text-sm';
  const labelStyles = label
    ? 'font-medium text-gray-500 bg-gray-50'
    : 'text-gray-900';
  const growStyles = grow ? 'flex-1' : '';
  const widthStyles = width || (label ? 'w-[120px]' : 'min-w-[180px]');

  return (
    <div
      className={`${baseStyles} ${labelStyles} ${growStyles} ${widthStyles} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Table: 테이블 컴포넌트 그룹
 */
export const Table = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto mt-5 ${className}`}>
      <table className="w-full border-collapse border border-gray-200">
        {children}
      </table>
    </div>
  );
};

Table.Head = ({ children, className = '' }) => (
  <thead className={className}>{children}</thead>
);

Table.Body = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-gray-200 ${className}`}>{children}</tbody>
);

Table.Row = ({ children, className = '' }) => (
  <tr className={className}>{children}</tr>
);

Table.Th = ({ children, className = '' }) => (
  <th
    className={`px-4 py-3 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 ${className}`}
  >
    {children}
  </th>
);

Table.Td = ({ children, align = 'left', className = '' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td
      className={`px-4 py-3 text-sm border border-gray-200 ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
};

Table.Title = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-gray-900 mb-3 ${className}`}>
    {children}
  </h3>
);

/**
 * Badge: 라벨, 상태, 카테고리 등을 표시하는 작은 시각적 요소
 * @param {Object} props
 * @param {React.ReactNode} props.children - 배지 내부 콘텐츠
 * @param {'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'error' | 'info' | 'gray'} [props.variant='default'] - 배지 스타일 변형
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - 배지 크기
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success:
      'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200',
    warning:
      'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-2.5 py-0.5 rounded-md',
    lg: 'text-base px-3 py-1 rounded-md',
  };

  return (
    <span
      className={`${baseStyles} ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Card, List, ListItem 컴포넌트 추가 (index.jsx 파일에 추가)

/**
 * Card: 콘텐츠를 담는 카드 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 카드 내부 콘텐츠
 * @param {'default' | 'primary' | 'outline'} [props.variant='default'] - 카드 스타일 변형
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-lg shadow-sm overflow-hidden';

  const variantStyles = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-blue-50 border border-blue-200',
    outline: 'bg-transparent border border-gray-300',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card.Header: 카드 헤더 컴포넌트
 */
Card.Header = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card.Title: 카드 제목 컴포넌트
 */
Card.Title = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card.Content: 카드 내용 컴포넌트
 */
Card.Content = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card.Footer: 카드 푸터 컴포넌트
 */
Card.Footer = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * List: 항목 목록을 표시하는 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 리스트 항목들
 * @param {'ul' | 'ol'} [props.as='ul'] - HTML 태그 유형
 * @param {'none' | 'disc' | 'decimal'} [props.type='none'] - 리스트 스타일 유형
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const List = ({
  children,
  as = 'ul',
  type = 'none',
  className = '',
  ...props
}) => {
  const Component = as;

  const listStyles = {
    none: 'list-none',
    disc: 'list-disc pl-5',
    decimal: 'list-decimal pl-5',
  };

  return (
    <Component
      className={`space-y-1 ${listStyles[type]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * ListItem: 목록의 개별 항목 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 항목 내용
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const ListItem = ({ children, className = '', ...props }) => {
  return (
    <li className={`text-gray-700 ${className}`} {...props}>
      {children}
    </li>
  );
};

/**
 * Alert: 알림 메시지 컴포넌트 --> notification modal 컴포넌트 별도 존재..삭제할지..확인피요
 * @param {Object} props
 * @param {React.ReactNode} props.children - 알림 내용
 * @param {'default' | 'destructive' | 'success' | 'warning' | 'info'} [props.variant='default'] - 알림 스타일
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const Alert = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-gray-100 border-gray-300 text-gray-800',
    destructive: 'bg-red-100 border-red-300 text-red-800',
    success: 'bg-green-100 border-green-300 text-green-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
  };

  return (
    <div
      className={`p-4 rounded-md border-l-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
