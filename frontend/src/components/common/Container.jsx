const Container = ({ children, className = "", as: Component = "div" }) => {
  return (
    <Component className={`container ${className}`.trim()}>
      {children}
    </Component>
  );
};

export default Container;