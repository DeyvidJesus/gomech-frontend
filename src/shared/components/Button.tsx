import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={className}
      disabled={isDisabled}
      style={style}
      {...props}
    >
      {loading && (
        <span className="inline-flex items-center justify-center flex-shrink-0">
          ⏳
        </span>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="inline-flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}

      <span className="inline-flex items-center whitespace-nowrap">
        {children}
      </span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
