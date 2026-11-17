import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { FieldHelp as FoundingHelp } from "../../shared/FieldHelp.js";
export { FieldHelp as FoundingHelp } from "../../shared/FieldHelp.js";
export function FoundingField({
  title,
  description,
  help,
  optional = false,
  error,
  children,
}: {
  title: ReactNode;
  description?: string;
  help?: ReactNode;
  optional?: boolean;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId(),
    errorId = id + "-error",
    descriptionId = id + "-description";
  const describedBy = [children.props["aria-describedby"], description && descriptionId, error && errorId]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="villages-founding-field">
      <div className="villages-founding-field-heading">
        <label htmlFor={id}>
          {title}
          {optional ? <small>Optional</small> : null}
        </label>
        {help ? <FoundingHelp label={typeof title === "string" ? title : "field"}>{help}</FoundingHelp> : null}
      </div>
      {description ? (
        <p className="villages-founding-field-description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {cloneElement(children, {
        id,
        "aria-describedby": describedBy || undefined,
        ...(error ? { "aria-invalid": true } : {}),
      })}
      {error ? (
        <p id={errorId} role="alert" data-founding-problem tabIndex={-1}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
