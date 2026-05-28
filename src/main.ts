import { startFractal } from './fractal_entry.js';

type PageKey = 'home' | 'fractals' | 'empty1' | 'empty2' | 'empty3';

const pages: Record<PageKey, HTMLElement> =
{
	home: document.getElementById("homepage")!,
	fractals: document.getElementById("fractals-page")!,
	empty1: document.getElementById("empty1-page")!,
	empty2: document.getElementById("empty2-page")!,
	empty3: document.getElementById("empty3-page")!,
};

let currentPage = "home";
let fractalInitialized = false;

function showPage(page: PageKey)
{
	for (const key in pages)
	{
		const entry = pages[key as PageKey];
		if (entry == null)
		{
			continue;
		}
		entry.classList.remove("active");
		entry.style.display = "none";
	}
	pages[page].classList.add("active");
	pages[page].style.display = "block";
	currentPage = page;
	if (page == "fractals")
	{
		document.body.style.overflow = "hidden";
		if (fractalInitialized == false)
		{
			startFractal();
			fractalInitialized = true;
		}
	}
	else
	{
		document.body.style.overflow = "";
	}
}

document.getElementById("project-buttons")!.addEventListener("click", e =>
{
	if (e.target instanceof HTMLButtonElement)
	{
		const page = e.target.dataset.project as PageKey;
		if (page == null)
		{
			return;
		}
		showPage(page);
	}
});

document.querySelectorAll(".spa-back").forEach(btn =>
{
	btn.addEventListener("click", () => showPage("home"));
});

showPage("home");