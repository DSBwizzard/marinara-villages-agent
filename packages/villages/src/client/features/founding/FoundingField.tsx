import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { FieldHelp as FoundingHelp } from "../../shared/FieldHelp.js";
export { FieldHelp as FoundingHelp } from "../../shared/FieldHelp.js";
export function FoundingField({
  title,
  help,
  optional = false,
  error,
  children,
}: {
  title: ReactNode;
  help?: ReactNode;
  optional?: boolean;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId(),
    errorId = id + "-error";
  return (
    <div className="villages-founding-field">
      <div className="villages-founding-field-heading">
        <label htmlFor={id}>
          {title}
          {optional ? <small>Optional</small> : null}
        </label>
        {help ? <FoundingHelp label={typeof title === "string" ? title : "field"}>{help}</FoundingHelp> : null}
      </div>
      {cloneElement(children, {
        id,
        ...(error
          ? {
              "aria-invalid": true,
              "aria-describedby": [children.props["aria-describedby"], errorId].filter(Boolean).join(" "),
            }
          : {}),
      })}
      {error ? (
        <p id={errorId} role="alert" data-founding-problem tabIndex={-1}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
