/*
	Everything to to with the UI should be in this file

	Some general stuff about UI objects:
	  • The id parameter is not strictly necessary, but help when looking at the html code in a browser
	  • The align parameter is a string with 2 characters:
	      - The first character is vertical alignment; the second is horizontal.
	      - Possible vertical values are:
	          ~ "t" - Top
	          ~ "c" - Centre (only works if width and height are specified)
	          ~ "b" - Bottom
	      - Possible horizontal values are:
	          ~ "l" - Left
	          ~ "c" - Centre (only works if width and height are specified)
	          ~ "r" - Right
	  • The create() function is to set things specific to that type of element; it should always be overridden
*/

class UiElement {
	constructor(elemType, id, x, y, align) {
		if (new.target === UiElement) throw TypeError("Cannot instantiate UiElement class");

		this.elemType = elemType;
		this.id = id;
		this.x = x;
		this.y = y;
		this.align = align;
	}

	create() {
		throw "UI element tried to run unimplemented create function";
	}
}


class UiWindow {
	constructor(id, x, y, align, w, h) {
		if (id == undefined || id == null) throw "Tried to make UI window with invalid ID";
		this.id = id;

		this.x = x;
		this.y = y;
		this.align = align;
		this.w = w;
		this.h = h;

		this.opacity = 1;

		this.objects = [];
	}

	addObject(object) {
		this.objects.push(object);

		var objElem = document.createElement(object.elemType);
		objElem.id = object.id;

		object.elem = objElem;

		object.create();

		// Set the size of the element
		if (object.w != undefined)
			objElem.style.width = object.w + "px";
		if (object.h != undefined)
			objElem.style.height = object.h + "px";

		// Set the position of the element, using the alignment
		var horizAlign = object.align.substr(1);

		if (horizAlign == "l") // If aligned to left
			objElem.style.left = object.x + "px";
		else if (horizAlign == "r") // If aligned to right
			objElem.style.right = object.x + "px";
		else if (horizAlign == "c") // If aligned to center
			objElem.style.left = `calc(50% - ${object.w == undefined ? 0 : object.w/2}px + ${object.x}px)`;

		var vertAlign = object.align.substr(0, 1);

		if (vertAlign == "t") // If aligned to top
			objElem.style.top = object.y + "px";
		else if (vertAlign == "b") // If aligned to bottom
			objElem.style.bottom = object.y + "px";
		else if (vertAlign == "c") // If aligned to center
			objElem.style.top = `calc(50% - ${object.h == undefined ? 0 : object.h/2}px + ${object.y}px)`;
	}

	addToPage() {
		// Remove the window from the page if it already exists
		if (ui.querySelector("#"+this.id) != undefined)
			ui.removeChild(ui.querySelector("#"+this.id))

		var win = document.createElement("div");
		win.className = "uiWindow";
		win.id = this.id;

		// Set the size of the window
		win.style.width = this.w + "px";
		win.style.height = this.h + "px";

		// Set the position of the window, using the alignment
		var horizAlign = this.align.substr(1);

		if (horizAlign == "l") // If aligned to left
			win.style.left = this.x + "px";
		else if (horizAlign == "r") // If aligned to right
			win.style.left = `calc(100% - ${this.x}px - ${this.w}px)`;
		else if (horizAlign == "c") // If aligned to center
			win.style.left = `calc(50% - ${this.w/2}px + ${this.x}px)`;

		var vertAlign = this.align.substr(0, 1);

		if (vertAlign == "t") // If aligned to top
			win.style.top = this.y + "px";
		else if (vertAlign == "b") // If aligned to bottom
			win.style.top = `calc(100% - ${this.y}px - ${this.h}px)`;
		else if (vertAlign == "c") // If aligned to center
			win.style.top = `calc(50% - ${this.h/2}px + ${this.y}px)`;

		// 
		for (var i=0; i<this.objects.length; i++) {
			var o = this.objects[i];
			if (o.elem == undefined) continue;
			win.appendChild(o.elem);
		}

		ui.appendChild(win);

		this.win = win;
	}

	hide() {
		this.win.style.display = "none";
	}

	show() {
		this.win.style.display = "block";
	}

	setOpacity(newOpacity) {
		var rgba = getBackgroundColorRGBA(this.win);
		rgba[3] = newOpacity;
		setBackgroundColorRGBA(this.win, rgba);
	}
}

class UiLabel extends UiElement {
	constructor(id, x, y, align, text, font) {
		super("span", id, x, y, align);

		this.text = text;
		this.font = font;
	}

	updateValue(newValue) {
		this.text = newValue.toString();

		if (this.elem == undefined) return; // If the label has not been created as an HTML object then return now to avoid errors
		this.elem.innerText = newValue.toString();
	}

	create() {
		this.elem.className = "uiLabel";

		this.elem.style.font = this.font;
		this.elem.innerText = this.text.toString();
	}
}

class UiButton extends UiElement {
	constructor(id, x, y, align, w, h, text, font, callback) {
		super("button", id, x, y, align);

		this.x = x;
		this.y = y;
		this.text = text;
		this.font = font;

		this.callback = callback;
	}

	updateValue(newValue) {
		this.text = newValue.toString();

		if (this.elem == undefined) return;
		this.elem.innerText = newValue.toString();
	}

	create() {
		this.elem.className = "uiButton";

		this.elem.innerText = this.text.toString();

		this.elem.addEventListener("click", this.callback);
	}
}

class UiTextInput extends UiElement {
	constructor(id, x, y, align, w, h, placeholder, type) {
		super("input", id, x, y, align);

		this.w = w;
		this.h = h;
		this.placeholder = placeholder == null ? "" : placeholder;

		this.type = type;
	}

	create() {
		this.elem.className = "uiTextInput";

		this.elem.placeholder = this.placeholder;

		this.elem.type = this.type;
	}

	getValue() {
		return this.elem.value;
	}

	clear() {
		this.elem.value = "";
	}

	pop() {
		var val = this.getValue();
		this.clear();
		return val;
	}
}
