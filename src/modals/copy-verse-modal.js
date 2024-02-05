import { __awaiter } from "tslib";
import { Modal, Setting } from "obsidian";
import { getTextOfVerses } from "../logic/copy-command";
/**
 * Async function for fetching preview
 */
function setPreviewText(previewEl, userInput, pluginSettings, translationPath, linkOnly) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield getTextOfVerses(this.app, userInput, pluginSettings, translationPath, linkOnly, false);
            previewEl.setText(res);
        }
        catch (_a) {
            previewEl.setText("");
            return;
        }
    });
}
export var LinkType;
(function (LinkType) {
    LinkType["First"] = "First verse";
    LinkType["FirstOtherInvis"] = "First verse + other invisible";
    LinkType["FirstLast"] = "First and last verse";
    LinkType["FirstLastOtherInvis"] = "First and last + other invisible";
    LinkType["All"] = "All verses";
    LinkType["AllInvis"] = "All verses, invisible";
})(LinkType || (LinkType = {}));
/**
 * Modal that lets you insert bible reference by copying text of given verses
 */
export default class CopyVerseModal extends Modal {
    constructor(app, settings, onSubmit) {
        super(app);
        this.handleInput = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield getTextOfVerses(this.app, this.userInput, this.pluginSettings, this.translationPath, this.linkOnly);
                this.close();
                this.onSubmit(res);
            }
            catch (err) {
                return;
            }
        });
        this.onSubmit = onSubmit;
        this.pluginSettings = settings;
    }
    onOpen() {
        const { contentEl } = this;
        let previewEl;
        const refreshPreview = () => {
            setPreviewText(previewEl, this.userInput, this.pluginSettings, this.translationPath, this.linkOnly);
        };
        // Add heading
        contentEl.createEl("h3", { text: "Copy verse by bible reference" });
        // Add Textbox for reference
        new Setting(contentEl).setName("Insert reference").addText((text) => text
            .onChange((value) => {
            this.userInput = value;
            refreshPreview();
        })
            .inputEl.focus()); // Sets focus to input field
        // Add translation picker
        if (this.pluginSettings.enableMultipleTranslations &&
            this.pluginSettings.translationsPaths !== "") {
            const transationPicker = new Setting(contentEl).setName("Pick translation");
            let buttons = [];
            let buttonPathMap = new Map();
            this.pluginSettings.parsedTranslationPaths.forEach((path) => {
                // display translation buttons
                transationPicker.addButton((btn) => {
                    buttons.push(btn);
                    buttonPathMap.set(btn, path);
                    let splittedPath = path.split("/");
                    btn.setButtonText(splittedPath[splittedPath.length - 2]);
                });
                buttons.forEach((btn) => {
                    // make sure that only one is selected at a time
                    btn.onClick(() => {
                        buttons.forEach((b) => b.removeCta()); // remove CTA from all buttons
                        btn.setCta(); // set CTA to this button
                        this.translationPath = buttonPathMap.get(btn);
                        refreshPreview();
                    });
                });
                // preselect the first button/trnaslation
                buttons.first().setCta();
                this.translationPath = buttonPathMap.get(buttons.first());
            });
        }
        // add link-only options
        this.linkOnly = this.pluginSettings.linkOnly;
        new Setting(contentEl).setName("Link only").addToggle((tgl) => {
            tgl.setValue(this.pluginSettings.linkOnly);
            tgl.onChange((val) => {
                this.linkOnly = val;
                refreshPreview();
            });
        });
        // Add preview
        contentEl.createEl("label", { text: "Preview" });
        previewEl = contentEl.createEl("textarea", {
            cls: "copy-preview",
            attr: { readonly: true },
        });
        // Add button for submit/exit
        new Setting(contentEl).addButton((btn) => {
            btn.setButtonText("Link").setCta().onClick(this.handleInput);
        });
        // Allow user to exit using Enter key
        contentEl.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.handleInput();
            }
        };
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS12ZXJzZS1tb2RhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcHktdmVyc2UtbW9kYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBd0IsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFeEQ7O0dBRUc7QUFDSCxTQUFlLGNBQWMsQ0FDNUIsU0FBOEIsRUFDOUIsU0FBaUIsRUFDakIsY0FBOEIsRUFDOUIsZUFBdUIsRUFDdkIsUUFBaUI7O1FBRWpCLElBQUk7WUFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLGVBQWUsQ0FDaEMsSUFBSSxDQUFDLEdBQUcsRUFDUixTQUFTLEVBQ1QsY0FBYyxFQUNkLGVBQWUsRUFDZixRQUFRLEVBQ1IsS0FBSyxDQUNMLENBQUM7WUFDRixTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO1FBQUMsV0FBTTtZQUNQLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsT0FBTztTQUNQO0lBQ0YsQ0FBQztDQUFBO0FBRUQsTUFBTSxDQUFOLElBQVksUUFPWDtBQVBELFdBQVksUUFBUTtJQUNuQixpQ0FBcUIsQ0FBQTtJQUNyQiw2REFBaUQsQ0FBQTtJQUNqRCw4Q0FBa0MsQ0FBQTtJQUNsQyxvRUFBd0QsQ0FBQTtJQUN4RCw4QkFBa0IsQ0FBQTtJQUNsQiw4Q0FBa0MsQ0FBQTtBQUNuQyxDQUFDLEVBUFcsUUFBUSxLQUFSLFFBQVEsUUFPbkI7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBZSxTQUFRLEtBQUs7SUF1QmhELFlBQ0MsR0FBUSxFQUNSLFFBQXdCLEVBQ3hCLFFBQWtDO1FBRWxDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQXJCWixnQkFBVyxHQUFHLEdBQVMsRUFBRTtZQUN4QixJQUFJO2dCQUNILE1B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LFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3hDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILHFDQUFxQztRQUNyQyxTQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDL0IsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtnQkFDMUIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDbkI7UUFDRixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNOLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDM0IsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25CLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgQnV0dG9uQ29tcG9uZW50LCBNb2RhbCwgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBQbHVnaW5TZXR0aW5ncyB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7IGdldFRleHRPZlZlcnNlcyB9IGZyb20gXCIuLi9sb2dpYy9jb3B5LWNvbW1hbmRcIjtcclxuXHJcbi8qKlxyXG4gKiBBc3luYyBmdW5jdGlvbiBmb3IgZmV0Y2hpbmcgcHJldmlld1xyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gc2V0UHJldmlld1RleHQoXHJcblx0cHJldmlld0VsOiBIVE1MVGV4dEFyZWFFbGVtZW50LFxyXG5cdHVzZXJJbnB1dDogc3RyaW5nLFxyXG5cdHBsdWdpblNldHRpbmdzOiBQbHVnaW5TZXR0aW5ncyxcclxuXHR0cmFuc2xhdGlvblBhdGg6IHN0cmluZyxcclxuXHRsaW5rT25seTogYm9vbGVhblxyXG4pIHtcclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgcmVzID0gYXdhaXQgZ2V0VGV4dE9mVmVyc2VzKFxyXG5cdFx0XHR0aGlzLmFwcCxcclxuXHRcdFx0dXNlcklucHV0LFxyXG5cdFx0XHRwbHVnaW5TZXR0aW5ncyxcclxuXHRcdFx0dHJhbnNsYXRpb25QYXRoLFxyXG5cdFx0XHRsaW5rT25seSxcclxuXHRcdFx0ZmFsc2VcclxuXHRcdCk7XHJcblx0XHRwcmV2aWV3RWwuc2V0VGV4dChyZXMpO1xyXG5cdH0gY2F0Y2gge1xyXG5cdFx0cHJldmlld0VsLnNldFRleHQoXCJcIik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZW51bSBMaW5rVHlwZSB7XHJcblx0Rmlyc3QgPSBcIkZpcnN0IHZlcnNlXCIsXHJcblx0Rmlyc3RPdGhlckludmlzID0gXCJGaXJzdCB2ZXJzZSArIG90aGVyIGludmlzaWJsZVwiLFxyXG5cdEZpcnN0TGFzdCA9IFwiRmlyc3QgYW5kIGxhc3QgdmVyc2VcIixcclxuXHRGaXJzdExhc3RPdGhlckludmlzID0gXCJGaXJzdCBhbmQgbGFzdCArIG90aGVyIGludmlzaWJsZVwiLFxyXG5cdEFsbCA9IFwiQWxsIHZlcnNlc1wiLFxyXG5cdEFsbEludmlzID0gXCJBbGwgdmVyc2VzLCBpbnZpc2libGVcIixcclxufVxyXG5cclxuLyoqXHJcbiAqIE1vZGFsIHRoYXQgbGV0cyB5b3UgaW5zZXJ0IGJpYmxlIHJlZmVyZW5jZSBieSBjb3B5aW5nIHRleHQgb2YgZ2l2ZW4gdmVyc2VzXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb3B5VmVyc2VNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuXHR1c2VySW5wdXQ6IHN0cmluZztcclxuXHRvblN1Ym1pdDogKHJlc3VsdDogc3RyaW5nKSA9PiB2b2lkO1xyXG5cdHBsdWdpblNldHRpbmdzOiBQbHVnaW5TZXR0aW5ncztcclxuXHR0cmFuc2xhdGlvblBhdGg6IHN0cmluZztcclxuXHRsaW5rT25seTogYm9vbGVhbjtcclxuXHJcblx0aGFuZGxlSW5wdXQgPSBhc3luYyAoKSA9PiB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBnZXRUZXh0T2ZWZXJzZXMoXHJcblx0XHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdFx0dGhpcy51c2VySW5wdXQsXHJcblx0XHRcdFx0dGhpcy5wbHVnaW5TZXR0aW5ncyxcclxuXHRcdFx0XHR0aGlzLnRyYW5zbGF0aW9uUGF0aCxcclxuXHRcdFx0XHR0aGlzLmxpbmtPbmx5XHJcblx0XHRcdCk7XHJcblx0XHRcdHRoaXMuY2xvc2UoKTtcclxuXHRcdFx0dGhpcy5vblN1Ym1pdChyZXMpO1xyXG5cdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdGFwcDogQXBwLFxyXG5cdFx0c2V0dGluZ3M6IFBsdWdpblNldHRpbmdzLFxyXG5cdFx0b25TdWJtaXQ6IChyZXN1bHQ6IHN0cmluZykgPT4gdm9pZFxyXG5cdCkge1xyXG5cdFx0c3VwZXIoYXBwKTtcclxuXHRcdHRoaXMub25TdWJtaXQgPSBvblN1Ym1pdDtcclxuXHRcdHRoaXMucGx1Z2luU2V0dGluZ3MgPSBzZXR0aW5ncztcclxuXHR9XHJcblxyXG5cdG9uT3BlbigpIHtcclxuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG5cdFx0bGV0IHByZXZpZXdFbDogSFRNTFRleHRBcmVhRWxlbWVudDtcclxuXHJcblx0XHRjb25zdCByZWZyZXNoUHJldmlldyA9ICgpID0+IHtcclxuXHRcdFx0c2V0UHJldmlld1RleHQoXHJcblx0XHRcdFx0cHJldmlld0VsLFxyXG5cdFx0XHRcdHRoaXMudXNlcklucHV0LFxyXG5cdFx0XHRcdHRoaXMucGx1Z2luU2V0dGluZ3MsXHJcblx0XHRcdFx0dGhpcy50cmFuc2xhdGlvblBhdGgsXHJcblx0XHRcdFx0dGhpcy5saW5rT25seVxyXG5cdFx0XHQpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBBZGQgaGVhZGluZ1xyXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvcHkgdmVyc2UgYnkgYmlibGUgcmVmZXJlbmNlXCIgfSk7XHJcblxyXG5cdFx0Ly8gQWRkIFRleHRib3ggZm9yIHJlZmVyZW5jZVxyXG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKS5zZXROYW1lKFwiSW5zZXJ0IHJlZmVyZW5jZVwiKS5hZGRUZXh0KCh0ZXh0KSA9PlxyXG5cdFx0XHR0ZXh0XHJcblx0XHRcdFx0Lm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy51c2VySW5wdXQgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdHJlZnJlc2hQcmV2aWV3KCk7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQuaW5wdXRFbC5mb2N1cygpXHJcblx0XHQpOyAvLyBTZXRzIGZvY3VzIHRvIGlucHV0IGZpZWxkXHJcblxyXG5cdFx0Ly8gQWRkIHRyYW5zbGF0aW9uIHBpY2tlclxyXG5cdFx0aWYgKFxyXG5cdFx0XHR0aGlzLnBsdWdpblNldHRpbmdzLmVuYWJsZU11bHRpcGxlVHJhbnNsYXRpb25zICYmXHJcblx0XHRcdHRoaXMucGx1Z2luU2V0dGluZ3MudHJhbnNsYXRpb25zUGF0aHMgIT09IFwiXCJcclxuXHRcdCkge1xyXG5cdFx0XHRjb25zdCB0cmFuc2F0aW9uUGlja2VyID0gbmV3IFNldHRpbmcoY29udGVudEVsKS5zZXROYW1lKFxyXG5cdFx0XHRcdFwiUGljayB0cmFuc2xhdGlvblwiXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRsZXQgYnV0dG9uczogQnV0dG9uQ29tcG9uZW50W10gPSBbXTtcclxuXHRcdFx0bGV0IGJ1dHRvblBhdGhNYXAgPSBuZXcgTWFwPEJ1dHRvbkNvbXBvbmVudCwgc3RyaW5nPigpO1xyXG5cclxuXHRcdFx0dGhpcy5wbHVnaW5TZXR0aW5ncy5wYXJzZWRUcmFuc2xhdGlvblBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcclxuXHRcdFx0XHQvLyBkaXNwbGF5IHRyYW5zbGF0aW9uIGJ1dHRvbnNcclxuXHRcdFx0XHR0cmFuc2F0aW9uUGlja2VyLmFkZEJ1dHRvbigoYnRuKSA9PiB7XHJcblx0XHRcdFx0XHRidXR0b25zLnB1c2goYnRuKTtcclxuXHRcdFx0XHRcdGJ1dHRvblBhdGhNYXAuc2V0KGJ0biwgcGF0aCk7XHJcblx0XHRcdFx0XHRsZXQgc3BsaXR0ZWRQYXRoID0gcGF0aC5zcGxpdChcIi9cIik7XHJcblx0XHRcdFx0XHRidG4uc2V0QnV0dG9uVGV4dChzcGxpdHRlZFBhdGhbc3BsaXR0ZWRQYXRoLmxlbmd0aCAtIDJdKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0YnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcclxuXHRcdFx0XHRcdC8vIG1ha2Ugc3VyZSB0aGF0IG9ubHkgb25lIGlzIHNlbGVjdGVkIGF0IGEgdGltZVxyXG5cdFx0XHRcdFx0YnRuLm9uQ2xpY2soKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRidXR0b25zLmZvckVhY2goKGIpID0+IGIucmVtb3ZlQ3RhKCkpOyAvLyByZW1vdmUgQ1RBIGZyb20gYWxsIGJ1dHRvbnNcclxuXHRcdFx0XHRcdFx0YnRuLnNldEN0YSgpOyAvLyBzZXQgQ1RBIHRvIHRoaXMgYnV0dG9uXHJcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNsYXRpb25QYXRoID0gYnV0dG9uUGF0aE1hcC5nZXQoYnRuKTtcclxuXHRcdFx0XHRcdFx0cmVmcmVzaFByZXZpZXcoKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQvLyBwcmVzZWxlY3QgdGhlIGZpcnN0IGJ1dHRvbi90cm5hc2xhdGlvblxyXG5cdFx0XHRcdGJ1dHRvbnMuZmlyc3QoKS5zZXRDdGEoKTtcclxuXHRcdFx0XHR0aGlzLnRyYW5zbGF0aW9uUGF0aCA9IGJ1dHRvblBhdGhNYXAuZ2V0KGJ1dHRvbnMuZmlyc3QoKSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGFkZCBsaW5rLW9ubHkgb3B0aW9uc1xyXG5cdFx0dGhpcy5saW5rT25seSA9IHRoaXMucGx1Z2luU2V0dGluZ3MubGlua09ubHk7XHJcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpLnNldE5hbWUoXCJMaW5rIG9ubHlcIikuYWRkVG9nZ2xlKCh0Z2wpID0+IHtcclxuXHRcdFx0dGdsLnNldFZhbHVlKHRoaXMucGx1Z2luU2V0dGluZ3MubGlua09ubHkpO1xyXG5cdFx0XHR0Z2wub25DaGFuZ2UoKHZhbCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMubGlua09ubHkgPSB2YWw7XHJcblx0XHRcdFx0cmVmcmVzaFByZXZpZXcoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBZGQgcHJldmlld1xyXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBcIlByZXZpZXdcIiB9KTtcclxuXHRcdHByZXZpZXdFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbChcInRleHRhcmVhXCIsIHtcclxuXHRcdFx0Y2xzOiBcImNvcHktcHJldmlld1wiLFxyXG5cdFx0XHRhdHRyOiB7IHJlYWRvbmx5OiB0cnVlIH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBZGQgYnV0dG9uIGZvciBzdWJtaXQvZXhpdFxyXG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKS5hZGRCdXR0b24oKGJ0bikgPT4ge1xyXG5cdFx0XHRidG4uc2V0QnV0dG9uVGV4dChcIkxpbmtcIikuc2V0Q3RhKCkub25DbGljayh0aGlzLmhhbmRsZUlucHV0KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEFsbG93IHVzZXIgdG8gZXhpdCB1c2luZyBFbnRlciBrZXlcclxuXHRcdGNvbnRlbnRFbC5vbmtleWRvd24gPSAoZXZlbnQpID0+IHtcclxuXHRcdFx0aWYgKGV2ZW50LmtleSA9PT0gXCJFbnRlclwiKSB7XHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLmhhbmRsZUlucHV0KCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRvbkNsb3NlKCkge1xyXG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcclxuXHR9XHJcbn1cclxuIl19