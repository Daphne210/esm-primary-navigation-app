import React, { memo, useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  HeaderContainer,
  Header,
  HeaderMenuButton,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from "@carbon/react";
import { Close, UserAvatarFilledAlt } from "@carbon/react/icons";
import {
  LoggedInUser,
  useLayoutType,
  ExtensionSlot,
  ConfigurableLink,
  useSession,
  useConnectedExtensions,
  useConfig,
} from "@openmrs/esm-framework";
import { isDesktop } from "../../utils";
import Logo from "../logo/logo.component";
import NotificationsMenuPanel from "../navbar-header-panels/notifications-menu-panel.component";
import OfflineBanner from "../offline-banner/offline-banner.component";
import UserMenuPanel from "../navbar-header-panels/user-menu-panel.component";
import SideMenuPanel from "../navbar-header-panels/side-menu-panel.component";
import styles from "./navbar.scss";
import AppSearchLaunch from "../app-search-icon/app-search-icon.component";
import NotificationsMenuButton from "../notifications-menu/notifications-menu-button.component";

const Navbar: React.FC = () => {
  const session = useSession();
  const config = useConfig();
  const [user, setUser] = useState<LoggedInUser | null | false>(
    session?.user ?? null
  );
  const [activeHeaderPanel, setActiveHeaderPanel] = useState<string>(null);
  const allowedLocales = session?.allowedLocales ?? null;
  const layout = useLayoutType();
  const navMenuItems = useConnectedExtensions(
    "patient-chart-dashboard-slot"
  ).map((e) => e.id);
  const openmrsSpaBase = window["getOpenmrsSpaBase"]();
  const appMenuItems = useConnectedExtensions("app-menu-slot");
  const userMenuItems = useConnectedExtensions("user-panel-slot");
  const isActivePanel = useCallback(
    (panelName: string) => activeHeaderPanel === panelName,
    [activeHeaderPanel]
  );

  const togglePanel = useCallback(
    (panelName: string) =>
      setActiveHeaderPanel((activeHeaderPanel) =>
        activeHeaderPanel === panelName ? null : panelName
      ),
    []
  );

  const logout = useCallback(() => setUser(false), []);

  const hidePanel = useCallback(() => {
    setActiveHeaderPanel(null);
  }, []);

  const showHamburger = useMemo(
    () => !isDesktop(layout) && navMenuItems.length > 0,
    [navMenuItems.length, layout]
  );
  const showAppMenu = useMemo(
    () => appMenuItems.length > 0,
    [appMenuItems.length]
  );
  const showUserMenu = useMemo(
    () => userMenuItems.length > 0,
    [userMenuItems.length]
  );

  const HeaderItems = () => (
    <>
      <OfflineBanner />
      <Header aria-label="OpenMRS">
        {showHamburger && (
          <HeaderMenuButton
            aria-label="Open menu"
            isCollapsible
            className={styles.headerMenuButton}
            onClick={(event) => {
              togglePanel("sideMenu");
              event.stopPropagation();
            }}
            isActive={isActivePanel("sideMenu")}
          />
        )}
        <ConfigurableLink to={config.logo.link}>
          <div className={showHamburger ? "" : styles.spacedLogo}>
            <Logo />
          </div>
        </ConfigurableLink>
        <ExtensionSlot
          className={styles.dividerOverride}
          name="top-nav-info-slot"
        />
        <HeaderGlobalBar className={styles.headerGlobalBar}>
          <ExtensionSlot
            name="top-nav-actions-slot"
            className={styles.topNavActionsSlot}
          />
          <ExtensionSlot
            name="notifications-menu-button-slot"
            state={{
              isActivePanel: isActivePanel,
              togglePanel: togglePanel,
            }}
          />
          {showUserMenu && (
            <HeaderGlobalAction
              aria-label="Users"
              aria-labelledby="Users Avatar Icon"
              className={`${
                isActivePanel("userMenu")
                  ? styles.headerGlobalBarButton
                  : styles.activePanel
              }`}
              enterDelayMs={500}
              name="Users"
              isActive={isActivePanel("userMenu")}
              onClick={(event) => {
                togglePanel("userMenu");
                event.stopPropagation();
              }}
            >
              {isActivePanel("userMenu") ? (
                <Close size={20} />
              ) : (
                <UserAvatarFilledAlt size={20} />
              )}
            </HeaderGlobalAction>
          )}
        </HeaderGlobalBar>
        {!isDesktop(layout) && (
          <SideMenuPanel
            hidePanel={hidePanel}
            expanded={isActivePanel("sideMenu")}
          />
        )}
        <NotificationsMenuButton />
        {showAppMenu && <AppSearchLaunch />}
        <NotificationsMenuPanel expanded={isActivePanel("notificationsMenu")} />
        {showUserMenu && (
          <UserMenuPanel
            user={user}
            session={session}
            expanded={isActivePanel("userMenu")}
            allowedLocales={allowedLocales}
            onLogout={logout}
            hidePanel={hidePanel}
          />
        )}
      </Header>
    </>
  );

  if (user && session) {
    return session.sessionLocation ? (
      <HeaderContainer render={memo(HeaderItems)}></HeaderContainer>
    ) : (
      <Navigate
        to={`${openmrsSpaBase}login/location`}
        state={{
          referrer: window.location.pathname.slice(
            window.location.pathname.indexOf(openmrsSpaBase) +
              openmrsSpaBase.length -
              1
          ),
        }}
      />
    );
  }

  return (
    <Navigate
      to={`${openmrsSpaBase}login`}
      state={{
        referrer: window.location.pathname.slice(
          window.location.pathname.indexOf(openmrsSpaBase) +
            openmrsSpaBase.length -
            1
        ),
      }}
    />
  );
};

export default Navbar;
