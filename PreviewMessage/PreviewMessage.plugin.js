/**
 * @name PreviewMessage
 * @author SnappyCreeper
 * @description Instantly preview how your message will look before sending it. (Original by TheCommieAxolotl)
 * @version 1.0.4
 * @authorId 1031925360239058974
 * @source https://github.com/snappycreeper/BetterDiscordPlugins/tree/main/PreviewMessage
 * @updateurl https://raw.githubusercontent.com/snappycreeper/BetterDiscordPlugins/main/PreviewMessage/PreviewMessage.plugin.js
 */

module.exports = class PreviewMessage {
    start() {
        this.patch();
    }

    stop() {
        BdApi.Patcher.unpatchAll("PreviewMessage");
    }

    patch() {
        const { Webpack, React, Patcher, Components } = BdApi;

        const ChatButtonsGroup = Webpack.getBySource("showAllButtons", "promotionsByType")?.A;
        const ChatButton = Webpack.getBySource("CHAT_INPUT_BUTTON_NOTIFICATION")?.A;

        if (!ChatButtonsGroup || !ChatButton) return;

        Patcher.after("PreviewMessage", ChatButtonsGroup, "type", (_, args, res) => {
            if (
                args.length === 2 &&
                !args[0].disabled &&
                args[0].type.analyticsName === "normal" &&
                res?.props?.children &&
                Array.isArray(res.props.children)
            ) {
                if (res.props.children.some(child =>
                    child?.props?.className === "pm-preview-btn" ||
                    child?.props?.children?.props?.className === "pm-preview-btn"
                )) return;

                const button = React.createElement(
                    ChatButton,
                    null,
                    React.createElement(
                        "svg",
                        {
                            width: "24",
                            height: "24",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2"
                        },
                        React.createElement("path", {
                            d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        }),
                        React.createElement("circle", {
                            cx: "12",
                            cy: "12",
                            r: "3"
                        })
                    )
                );

                const wrapper = React.createElement(
                    "div",
                    {
                        className: "pm-preview-btn",
                        onClick: (e) => {
                            e.preventDefault();
                            this.sendPreview();
                        },
                        style: { padding: "5px", display: "flex" }
                    },
                    button
                );

                const withTooltip = React.createElement(
                    Components.Tooltip,
                    { text: "Preview Message" },
                    (props) => React.createElement("div", { ...props }, wrapper)
                );

                res.props.children.unshift(withTooltip);
            }
        });
    }

    sendPreview() {
        const { Webpack, UI } = BdApi;

        const SelectedChannelStore = Webpack.getModule(m => m.getChannelId && m.getLastSelectedChannelId);
        const DraftStore = Webpack.getModule(m => m.getDraft);
        const MessageActions = Webpack.getModule(m => m.sendBotMessage);

        if (!SelectedChannelStore || !DraftStore || !MessageActions) {
            return UI.showToast("Critical: Discord modules not found.", { type: "error" });
        }

        const channelID = SelectedChannelStore.getChannelId();
        const draft = DraftStore.getDraft(channelID, 0);

        if (draft && draft.trim()) {
            MessageActions.sendBotMessage(channelID, draft);
        } else {
            UI.showToast("Type something first!", { type: "warn" });
        }
    }
};

