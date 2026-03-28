/**
 * @name CustomKaomojis
 * @author SnappyCreeper
 * @description You can add custom kaomojis!
 * @version 1.0.0
 * @authorId 1031925360239058974
 * @source https://github.com/snappycreeper/BetterDiscordPlugins/tree/main/CustomKaomojis
 * @updateurl https://raw.githubusercontent.com/snappycreeper/BetterDiscordPlugins/main/CustomKaomojis/CustomKaomojis.plugin.js
 */

module.exports = class CustomKaomojis {
    start() {
        this.texts = BdApi.Data.load("CustomKaomojis", "texts") || [];

        if (this.texts.length && typeof this.texts[0] === "string") {
            this.texts = this.texts.map(t => ({
                id: Date.now() + Math.random(),
                text: t
            }));
            BdApi.Data.save("CustomKaomojis", "texts", this.texts);
        }

        this.observer = new MutationObserver(() => this.inject());
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    stop() {
        this.observer?.disconnect();
    }

    inject() {
        const container = document.querySelector(".kaomojiList__81b99");
        if (!container) return;

        if (container.querySelector(".custom-kaomoji-category")) return;

        const category = document.createElement("div");
        category.className = "kaomojiCategory__81b99 custom-kaomoji-category";

        const label = document.createElement("div");
        label.className = "text-xs/semibold_cf4812 categoryLabel__81b99";
        label.setAttribute("data-text-variant", "text-xs/semibold");
        label.style.color = "var(--text-muted)";
        label.textContent = "Custom";

        const grid = document.createElement("div");
        grid.className = "kaomojiGrid__81b99";

        this.grid = grid;

        const createButton = (obj, isAdd = false) => {
            const wrapper = document.createElement("div");
            wrapper.className = "kaomojiGridItem__81b99";

            const btn = document.createElement("button");
            btn.className = "button_a22cb0 sm_a22cb0 secondary_a22cb0 hasText_a22cb0 fullWidth_a22cb0";

            const inner = document.createElement("div");
            inner.className = "buttonChildrenWrapper_a22cb0";

            const inner2 = document.createElement("div");
            inner2.className = "buttonChildren_a22cb0";

            const span = document.createElement("span");
            span.className = "lineClamp1__4bd52 text-sm/medium_cf4812";
            span.setAttribute("data-text-variant", "text-sm/medium");
            span.textContent = isAdd ? "+" : obj.text;

            inner2.appendChild(span);
            inner.appendChild(inner2);
            btn.appendChild(inner);
            wrapper.appendChild(btn);

            if (isAdd) {
                btn.onclick = () => this.openModal();
            } else {
                btn.onclick = () => this.insertText(obj.text);

                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.openContextMenu(e, obj);
                };
            }

            return wrapper;
        };

        this.createButton = createButton;

        grid.appendChild(createButton(null, true));

        this.texts.forEach(obj => {
            grid.appendChild(createButton(obj));
        });

        category.appendChild(label);
        category.appendChild(grid);

        container.prepend(category);
    }

    refreshGrid() {
        if (!this.grid) return;

        this.grid.innerHTML = "";

        this.grid.appendChild(this.createButton(null, true));

        this.texts.forEach(obj => {
            this.grid.appendChild(this.createButton(obj));
        });
    }

    openModal() {
        let value = "";

        BdApi.UI.showConfirmationModal(
            "Add Custom Text",
            BdApi.React.createElement("textarea", {
                placeholder: "Enter text...",
                style: {
                    width: "100%",
                    height: "100px",
                    resize: "none",
                    boxSizing: "border-box",
                    background: "var(--background-secondary)",
                    color: "var(--text-normal)",
                    border: "1px solid var(--background-tertiary)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "var(--font-primary)",
                    outline: "none",
                    transition: "border 0.15s ease"
                },
                onFocus: (e) => {
                    e.target.style.border = "1px solid var(--brand-experiment)";
                },
                onBlur: (e) => {
                    e.target.style.border = "1px solid var(--background-tertiary)";
                },
                onChange: (e) => value = e.target.value
            }),
            {
                confirmText: "Save",
                onConfirm: () => {
                    if (!value.trim()) return;

                    this.texts.push({
                        id: Date.now() + Math.random(),
                        text: value
                    });

                    BdApi.Data.save("CustomKaomojis", "texts", this.texts);
                    this.refreshGrid();
                }
            }
        );
    }

    openContextMenu(e, obj) {
        const { ContextMenu } = BdApi;

        ContextMenu.open(e, ContextMenu.buildMenu([
            {
                label: "Edit",
                action: () => this.editText(obj)
            },
            {
                label: "Delete",
                danger: true,
                action: () => this.deleteText(obj)
            }
        ]));
    }

    editText(obj) {
        let value = obj.text;

        BdApi.UI.showConfirmationModal(
            "Edit Custom Text",
            BdApi.React.createElement("textarea", {
                defaultValue: obj.text,
                style: {
                    width: "100%",
                    height: "100px",
                    resize: "none",
                    boxSizing: "border-box",
                    background: "var(--background-secondary)",
                    color: "var(--text-normal)",
                    border: "1px solid var(--background-tertiary)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "var(--font-primary)",
                    outline: "none",
                    transition: "border 0.15s ease"
                },
                onFocus: (e) => {
                    e.target.style.border = "1px solid var(--brand-experiment)";
                },
                onBlur: (e) => {
                    e.target.style.border = "1px solid var(--background-tertiary)";
                },
                onChange: (e) => value = e.target.value
            }),
            {
                confirmText: "Save",
                onConfirm: () => {
                    if (!value.trim()) return;

                    const item = this.texts.find(t => t.id === obj.id);
                    if (item) {
                        item.text = value;
                        BdApi.Data.save("CustomKaomojis", "texts", this.texts);
                        this.refreshGrid();
                    }
                }
            }
        );
    }

    deleteText(obj) {
        this.texts = this.texts.filter(t => t.id !== obj.id);
        BdApi.Data.save("CustomKaomojis", "texts", this.texts);
        this.refreshGrid();
    }

    insertText(text) {
        const editor = document.querySelector('[role="textbox"]');
        if (!editor) return;

        editor.focus();

        const event = new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
        });

        editor.dispatchEvent(event);

        const event2 = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
        });

        editor.dispatchEvent(event2);

        document.body.dispatchEvent(new MouseEvent("mousedown", {
            bubbles: true
        }));

        document.body.dispatchEvent(new MouseEvent("mouseup", {
            bubbles: true
        }));

        document.body.dispatchEvent(new MouseEvent("click", {
            bubbles: true
        }));
    }
};