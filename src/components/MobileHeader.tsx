import {
  Menu,
} from "lucide-react";

type Props = {
  onMenu: () => void;
};

export default function MobileHeader({
  onMenu,
}: Props) {

  return (

    <header className="mobile-app-header">

      <button
        type="button"
        className="mobile-header-menu"
        aria-label="Open library"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>

      <div className="mobile-header-brand">

        <div className="mobile-topbar-mark">
          O
        </div>

        <div>
          <strong>OTLES</strong>
          <span>Mobile Viewer</span>
        </div>

      </div>

    </header>

  );

}
