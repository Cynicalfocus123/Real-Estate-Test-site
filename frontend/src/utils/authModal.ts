export type AuthModalMode = "login" | "signup";

export const OPEN_AUTH_MODAL_EVENT = "bhfl:open-auth-modal";

type OpenAuthModalEventDetail = {
  mode: AuthModalMode;
};

export function requestAuthModal(mode: AuthModalMode) {
  window.dispatchEvent(
    new CustomEvent<OpenAuthModalEventDetail>(OPEN_AUTH_MODAL_EVENT, {
      detail: { mode },
    }),
  );
}
