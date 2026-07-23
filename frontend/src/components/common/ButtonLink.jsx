import { Link } from "react-router-dom";

const ButtonLink = ({
  to,
  children,
  variant = "primary",
  size = "medium",
  className = "",
  ...props
}) => {
  const classes = [
    "button-link",
    `button-link--${variant}`,
    `button-link--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
};

export default ButtonLink;