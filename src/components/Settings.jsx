import React from 'react';
import SettingsActionCreators from '../action-creators/SettingsActionCreators';
import { Themes, ThemeNames, FontSizeOffsetRange } from '../constants/AppConstants';

import styles from './css/Settings.css';

const onDecreaseFontSizeButtonClick = () => SettingsActionCreators.decreaseFontSize();
const onIncreaseFontSizeButtonClick = () => SettingsActionCreators.increaseFontSize();

const onLightThemeButtonClick = () => SettingsActionCreators.switchTheme(Themes.LIGHT);
const onDarkThemeButtonClick = () => SettingsActionCreators.switchTheme(Themes.DARK);

const Settings = (props) => {
  const { fontSizeOffset, theme } = props.settingsState;

  const isMinFontSizeReached = fontSizeOffset === FontSizeOffsetRange[0];
  const isMaxFontSizeReached = fontSizeOffset === FontSizeOffsetRange[1];

  const isLightThemeEnabled = theme === Themes.LIGHT;
  const isDarkThemeEnabled = theme === Themes.DARK;

  return (
    <div>
      <h2>Settings</h2>

      <p className={styles.setting}>
        <label className={styles.label}>Text size</label>
        <button
          className={styles.decreaseFontSizeButton}
          onClick={onDecreaseFontSizeButtonClick}
          disabled={isMinFontSizeReached}
        />
        <button
          className={styles.increaseFontSizeButton}
          onClick={onIncreaseFontSizeButtonClick}
          disabled={isMaxFontSizeReached}
        />
      </p>

      <p className={styles.setting}>
        <label className={styles.label}>Theme</label>

        <span>
          {ThemeNames[theme]}

          {!isLightThemeEnabled &&
            <button className={styles.themeSwitchButton} onClick={onLightThemeButtonClick}>
              Change to Light Theme
            </button>}

          {!isDarkThemeEnabled &&
            <button className={styles.themeSwitchButton} onClick={onDarkThemeButtonClick}>
              Change to Dark Theme
            </button>}
        </span>
      </p>

      <h2>Shortcuts</h2>

      <ul>
        <li><kbd>Ctrl</kbd> + <kbd>T</kbd> or <kbd>Ctrl</kbd> + <kbd>N</kbd>{' '}
        to open a new tab</li>
        <li><kbd>Ctrl</kbd> + <kbd>W</kbd> to close the current file or tab</li>
        <li><kbd>Ctrl</kbd> + <kbd>+</kbd> to increase the text size</li>
        <li><kbd>Ctrl</kbd> + <kbd>-</kbd> to decrease the text size</li>
      </ul>
    </div>
  );
};

Settings.propTypes = {
  settingsState: React.PropTypes.object.isRequired,
};

export default Settings;
