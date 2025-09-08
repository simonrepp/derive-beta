module.exports = urbanize => `
    <div class="dim_overlay"
         onclick="
             document.querySelector('.toggle_menu').classList.toggle('visible');
             document.querySelector('.dim_overlay').classList.toggle('visible');
             return false;
         ">
    </div>
    <header>
        <div class="alignment_desktop">
            <span class="hover_menu_trigger">
                <a class="rounded_rect button_rect font_size_1_2" href="/">Festival</a>
                <div class="hover_menu">
                    <a class="rounded_rect button_rect font_size_1_2" href="/about/">About</a>
                    <a class="rounded_rect button_rect font_size_1_2" href="/partnerinnen/">PartnerInnen</a>
                </div>
            </span>
            <a class="rounded_rect button_rect font_size_1_2" href="/programm/">Programm</a>
            <a class="rounded_rect button_rect font_size_1_2" href="/beteiligte/">Beteiligte</a>
            <a class="rounded_rect button_rect font_size_1_2" href="/presse/">Presse</a>
            <a class="rounded_rect button_rect font_size_1_2" href="/kontakt/">Kontakt</a>
            <a class="language font_size_1_2" href="/english/">EN</a>
        </div>
        <div class="alignment_mobile">
            <div class="backdrop">
                <img class="logo" src="/images/urbanize_static_alternate.svg">
            </div>
            <a class="button_circle"
                 href="#"
                 onclick="
                    document.querySelector('.toggle_menu').classList.toggle('visible');
                    document.querySelector('.dim_overlay').classList.toggle('visible');
                    return false;
                 ">
                <span class="icon-menu"></span>
            </a>
            <div class="toggle_menu">
                <a href="/">Festival</a>
                <div class="indented">
                    <a href="/about/">About</a>
                    <a href="/partnerinnen/">PartnerInnen</a>
                </div>
                <a href="/programm/">Programm</a>
                <a href="/beteiligte/">Beteiligte</a>
                <a href="/presse/">Presse</a>
                <a href="/kontakt/">Kontakt</a>
                <a class="language" href="/english/">EN</a>
            </div>
        </div>
    </header>
`;
