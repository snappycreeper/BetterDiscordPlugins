/**
 * @name CustomKaomojis
 * @author SnappyCreeper
 * @description You can add custom kaomojis!
 * @version 1.0.1
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

        BdApi.DOM.addStyle("custom-kaomoji-scroll", `
        .ck-container {
            width: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
        }

        .ck-scroll .ck-container {
            justify-content: flex-start;
        }

        .ck-text {
            display: inline-block; 
            white-space: nowrap;
        }

        .ck-scroll:hover .ck-text.needs-scroll {
            animation: ck-scroll 6s linear infinite;
        }

        @keyframes ck-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        `);

        this.observer = new MutationObserver(() => this.inject());
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    stop() {
        this.observer?.disconnect();
        BdApi.DOM.removeStyle("custom-kaomoji-scroll");
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

            const container = document.createElement("div");
            container.className = "ck-container";

            const text = document.createElement("span");
            text.className = "ck-text";

            const content = isAdd ? "+" : obj.text;

            text.textContent = content;

            container.appendChild(text);
            btn.appendChild(container);
            wrapper.appendChild(btn);

            if (!isAdd) {
                setTimeout(() => {
                    if (text.scrollWidth > container.clientWidth) {
                        text.textContent = content + "     " + content;
                        text.classList.add("needs-scroll");
                        btn.classList.add("ck-scroll");
                    }
                }, 0);
            }

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
        this.texts.forEach(obj => grid.appendChild(createButton(obj)));

        category.appendChild(label);
        category.appendChild(grid);

        container.prepend(category);
    }

    refreshGrid() {
        if (!this.grid) return;

        this.grid.innerHTML = "";
        this.grid.appendChild(this.createButton(null, true));
        this.texts.forEach(obj => this.grid.appendChild(this.createButton(obj)));
    }

    openModal() {
        let value = "";

        BdApi.UI.showConfirmationModal(
            "Add Kaomoji",
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
                onFocus: (e) => e.target.style.border = "1px solid var(--brand-experiment)",
                onBlur: (e) => e.target.style.border = "1px solid var(--background-tertiary)",
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
            { label: "Edit", action: () => this.editText(obj) },
            { label: "Delete", danger: true, action: () => this.deleteText(obj) }
        ]));
    }

    editText(obj) {
        let value = obj.text;

        BdApi.UI.showConfirmationModal(
            "Edit Kaomoji",
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
                onFocus: (e) => e.target.style.border = "1px solid var(--brand-experiment)",
                onBlur: (e) => e.target.style.border = "1px solid var(--background-tertiary)",
                onChange: (e) => value = e.target.value
            }),
            {
                confirmText: "Save",
                onConfirm: () => {
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

        editor.dispatchEvent(new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
        }));

        editor.dispatchEvent(new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
        }));

        document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
};