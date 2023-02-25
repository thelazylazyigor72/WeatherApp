//! Function to detect what to display sunset or sunrise based on what cuurent date
export const sunriseOrSunset = (dtNow, sunrise, sunset) => {
	const textCont = document.querySelector(".cw__sun-smth");
	const dtCont = document.querySelector(".cw__sun-time");
	if (dtNow > sunrise && dtNow < sunset) {
		textCont.innerHTML = "Sunset";
		dtCont.innerHTML = dtConvert(sunset);
	} else if (dtNow > sunrise && dtNow > sunset) {
		textCont.innerHTML = "Sunset was at";
		dtCont.innerHTML = dtConvert(sunset);
	} else if (dtNow === sunrise) {
		textCont.innerHTML = "Sunrise";
		dtCont.innerHTML = dtConvert(sunrise);
	} else if (dtNow === sunset) {
		textCont.innerHTML = "Sunset";
		dtCont.innerHTML = dtConvert(sunset);
	} else if (dtNow < sunrise && dtNow < sunset) {
		textCont.innerHTML = "Sunrise";
		dtCont.innerHTML = dtConvert(sunrise);
	}
};

//! Function to convert timestamps to date
export const dtConvert = (dt) => {
	dt *= 1000;
	const date = new Date(dt);
	return date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

//! Function to convert timestamps to date (DAILY FORECAST)
export const dtConvertDaily = (dt) => {
	const week = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	dt *= 1000;
	const date = new Date(dt);
	return week[date.getDay()];
};

//! Function to round temp values
export const roundTemp = (temp) => {
	return Math.round(temp);
};

//! Function to convert given pressure to mm of Rtutniy Stolb
export const pressureConvert = (pressure) => {
	return pressure * 0.75;
};

//! Function to make this value more sense
export const visibilityConvert = (visibility) => {
	if (visibility === 10000) {
		return ">10";
	}
	return `~${Math.round(visibility / 1000)}`;
};

//! Function that delete forecast nodes to avoid swiper inits overlay, when repopulating those nodes
export const deleteNodes = () => {
	const cw = document.querySelector(".current-weather");
	const h = document.querySelector(".forecast__24-h");
	const d = document.querySelector(".forecast__weekly");
	if (cw && h && d) {
		cw.remove();
		h.remove();
		d.remove();
	}
};

//! Class to make buttons for particular swiper
export class Populator {
	constructor(containerClass, HTMLCode) {
		this.containerClass = containerClass;
		this.HTMLCode = HTMLCode;
	}

	renderBtns() {
		const prev = document.createElement("div");
		prev.classList.add("swiper-button-prev");
		const prevSkeleton = `
        <i class="fas fa-chevron-left"></i>
        `;
		prev.innerHTML = prevSkeleton;
		const next = document.createElement("div");
		next.classList.add("swiper-button-next");
		const nextSkeleton = `
        <i class="fas fa-chevron-right"></i>
        `;
		next.innerHTML = nextSkeleton;
		const container = document.querySelector(this.containerClass);
		container.append(prev);
		container.append(next);
	}

	renderBaseForSwiper() {
		const node = document.createElement("div");
		node.classList.add(this.containerClass);
		node.innerHTML = this.HTMLCode;
		const forecastContainer = document.querySelector(".forecast");
		forecastContainer.append(node);
	}
}
