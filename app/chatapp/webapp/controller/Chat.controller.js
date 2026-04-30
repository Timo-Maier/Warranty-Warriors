sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("chatapp.controller.Chat", {
        onInit: function () {
            const oChatModel = new JSONModel({
                messages: [],
                input: "",
                loading: false
            });
            this.getView().setModel(oChatModel, "chat");

            // Attach keydown after rendering so the textarea DOM exists
            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    const oTextArea = this.byId("inputField");
                    if (oTextArea) {
                        oTextArea.getFocusDomRef()?.addEventListener("keydown", (oEvent) => {
                            if (oEvent.key === "Enter" && !oEvent.shiftKey) {
                                oEvent.preventDefault();
                                this.onSendMessage();
                            }
                        });
                    }
                }
            }, this);
        },

        onSendMessage: function () {
            const oModel = this.getView().getModel("chat");
            const sInput = (oModel.getProperty("/input") || "").trim();
            if (!sInput || oModel.getProperty("/loading")) return;

            // Add user message
            const aMessages = oModel.getProperty("/messages");
            aMessages.push({ role: "user", content: sInput });
            oModel.setProperty("/messages", aMessages);
            oModel.setProperty("/input", "");
            oModel.setProperty("/loading", true);

            this._scrollToBottom();

            // Call the OData action
            const oODataModel = this.getView().getModel();
            const oAction = oODataModel.bindContext("/analyzeWarrantyClaims(...)");
            oAction.setParameter("query", sInput);

            oAction.execute().then(() => {
                const sResult = oAction.getBoundContext().getObject().value;
                const aUpdated = oModel.getProperty("/messages");
                aUpdated.push({ role: "assistant", content: sResult });
                oModel.setProperty("/messages", aUpdated);
                oModel.setProperty("/loading", false);
                this._scrollToBottom();
            }).catch(() => {
                const aUpdated = oModel.getProperty("/messages");
                aUpdated.push({ role: "assistant", content: "An error occurred. Please try again." });
                oModel.setProperty("/messages", aUpdated);
                oModel.setProperty("/loading", false);
                this._scrollToBottom();
            });
        },

        onClearChat: function () {
            const oModel = this.getView().getModel("chat");
            oModel.setProperty("/messages", []);
            oModel.setProperty("/input", "");
            oModel.setProperty("/loading", false);
        },

        _scrollToBottom: function () {
            setTimeout(() => {
                const oScroller = this.byId("chatContainer");
                if (oScroller) {
                    const oDomRef = oScroller.getDomRef();
                    if (oDomRef) oDomRef.scrollTop = oDomRef.scrollHeight;
                }
            }, 100);
        }
    });
});
