import { Dispatch, FC, SetStateAction } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { HiLink } from "react-icons/hi";
import { IoFootstepsSharp } from "react-icons/io5";

interface CopyLinkButtonProps {
  shareLinkClicked: boolean;
  changeShareLinkClicked: Dispatch<SetStateAction<boolean>>;
  changeLastClicked: Dispatch<SetStateAction<string>>;
  shareLinkAnimatingOut: boolean;
  copyShareLink?: string;
  path?: boolean;
}

const CopyLinkButton: FC<CopyLinkButtonProps> = ({
  shareLinkClicked,
  changeShareLinkClicked,
  changeLastClicked,
  shareLinkAnimatingOut,
  copyShareLink,
  path,
}) => {
  const handleShareLinkClicked = (shareLink: string) => {
    // Handle copy to clipboard
    const el = document.createElement("textarea");
    el.value = shareLink;
    el.setAttribute("readonly", "");
    el.setAttribute("style", "position: absolute; left: -9999px;");
    document.body.appendChild(el);

    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      // save current contentEditable/readOnly status
      let editable = el.contentEditable;
      let readOnly = el.readOnly;

      // convert to editable with readonly to stop iOS keyboard opening
      el.contentEditable = "true";
      el.readOnly = true;

      // create a selectable range
      let range = document.createRange();
      range.selectNodeContents(el);

      // select the range
      let selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        el.setSelectionRange(0, 999999);

        // restore contentEditable/readOnly to original state
        el.contentEditable = editable;
        el.readOnly = readOnly;
      }
    } else {
      el.select();
    }

    document.execCommand("copy");
    document.body.removeChild(el);

    if (!shareLinkClicked) {
      changeShareLinkClicked(true);
      changeLastClicked(path ? "path" : "link");
    }
  };

  return (
    <li className="share_button_outer_container">
      <button
        className="share_button link_share_button"
        onClick={() => {
          if (copyShareLink) {
            handleShareLinkClicked(copyShareLink);
          }
        }}
      >
        {path ? (
          <IoFootstepsSharp className="link_share_button_icon" />
        ) : (
          <HiLink className="link_share_button_icon" />
        )}
        {shareLinkClicked && (
          <div
            className={`tooltip_container ${
              shareLinkAnimatingOut ? "tooltip_animating_out" : ""
            }`}
          >
            <div className="tooltip_outer_wrapper">
              <div className="tooltip_inner_wrapper">
                <IoIosCheckmarkCircle />
                <span>{path ? "Path" : "Link"} copied!</span>
              </div>
            </div>
          </div>
        )}
      </button>
    </li>
  );
};

export default CopyLinkButton;
