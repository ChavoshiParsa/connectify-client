import LocaleSelector from './action-buttons/LocaleSelector';
import ModeToggle from './action-buttons/ModeToggle';

export default function SettingActionButtons() {
  return (
    <div className="flex items-center justify-center gap-1">
      <LocaleSelector />
      <ModeToggle />
    </div>
  );
}
