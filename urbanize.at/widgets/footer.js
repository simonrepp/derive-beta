const { URBANIZE_YEAR } = require('../config.js');

const DERIVE_INFO = `
    <img class="logo" alt="dérive" src="/images/derive.svg"><br>
    <div class="font_size_1_3">dérive — Verein für Stadtforschung</div>
    <div class="font_size_1_3"><a href="https://derive.at">derive.at</a></div>
    <br><br>
    <a class="button_circle" href="https://facebook.com/derivemagazin/" target="_blank">
        <svg width="1em" height="1em" version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <title>Facebook</title>
            <path d="m38.587 4.9842c-7.6253 0.083225-12.181 4.6927-12.273 12.331-0.02835 2.4242-3e-3 4.8502-3e-3 7.638h-8.1227v9.5467h8.2379v24.518h9.7648v-24.621h8.286c0.39635-3.2674 0.76167-6.2685 1.158-9.5403h-9.5114c0-2.2841-0.03288-4.192 0.0072-6.095 0.07219-3.4907 1.2544-4.6874 4.8086-4.8407 1.6074-0.06792 3.2194-0.01285 4.8728-0.01285v-8.61c-2.5102-0.11826-4.8684-0.34061-7.2247-0.31434z"></path>
        </svg>
    </a>
    <a class="button_circle" href="https://instagram.com/derive_urbanize/" target="_blank">
        <svg width="1em" height="1em" version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <title>Instagram</title>
            <path d="m31.927 6.4978c-3.9577 0.0016-7.9144 0.08803-11.863 0.25663-8.0852 0.34602-13.139 5.525-13.447 13.65-0.29559 7.8027-0.31982 15.631-0.0417 23.434 0.2781 7.8749 5.7317 13.118 13.659 13.521 3.9002 0.19918 7.819 0.03401 11.728 0.03401v0.08013c3.2761 0 6.554 0.07257 9.8258-0.01134 10.141-0.26494 15.329-5.1569 15.683-15.257 0.25183-7.1698 0.15568-14.366-0.0962-21.538-0.28686-8.1071-5.4795-13.555-13.582-13.909-3.9484-0.17325-7.9083-0.25826-11.866-0.25663zm-0.14445 4.4975c3.8663-0.01172 7.7337 0.06765 11.59 0.23414 5.9194 0.25618 9.1305 3.4083 9.4152 9.3189 0.37444 7.7983 0.3244 15.641-0.014 23.443-0.23437 5.4178-3.8793 8.5637-9.5884 8.8987-3.7163 0.21883-7.4565 0.04157-11.186 0.04157v0.02268c-3.6374 0-7.2846 0.14098-10.913-0.03402-6.3858-0.30425-9.758-3.5729-9.9573-9.9477-0.22333-7.2683-0.23032-14.553-0.0771-21.823 0.12476-5.9719 3.2264-9.533 9.1457-9.8418 3.8542-0.20039 7.7174-0.30263 11.584-0.31434zm13.897 4.2505a3.1058 3.1058 0 0 0-3.1052 3.1052 3.1058 3.1058 0 0 0 3.1052 3.1052 3.1058 3.1058 0 0 0 3.1052-3.1052 3.1058 3.1058 0 0 0-3.1052-3.1052zm-14.002 3.673c-6.9049 0.06021-12.556 5.5626-12.909 12.729-0.35036 7.0931 5.3862 13.162 12.771 13.508 7.0296 0.33067 13.194-5.2951 13.601-12.415 0.4139-7.2377-5.3868-13.5-12.793-13.813-0.22522-0.0094-0.4477-0.01172-0.67045-0.0098zm0.22776 4.5584c4.658-0.05027 8.5874 3.7576 8.6356 8.363 0.0503 4.8047-3.8166 8.7621-8.549 8.7511-4.8748-0.01134-8.579-3.7223-8.6228-8.6453-0.039-4.5966 3.8104-8.4185 8.5362-8.4688z"></path>
        </svg>
    </a>
    <br><br>
    <span class="font_size_0_8">© ${URBANIZE_YEAR} URBANIZE! INTERNATIONALES FESTIVAL FÜR URBANE ERKUNDUNGEN WIEN</span>
`;

module.exports = urbanize => `
    <footer>
        <div class="alignment">
            <div class="buttons">
                <a href="/newsletter/">
                    Newsletter
                </a>
                <a href="/impressum/">
                    Impressum
                </a>
            </div>
            <div class="derive_desktop">
                ${DERIVE_INFO}
            </div>
            <details class="archive">
                <summary>Festivalarchiv</summary>
                <div>
                    <a href="https://2024.urbanize.at/" target="_blank">urbanize! 2024</a>
                    <a href="https://2023.urbanize.at/" target="_blank">urbanize! 2023</a>
                    <a href="https://2022.urbanize.at/" target="_blank">urbanize! 2022</a>
                    <a href="https://2021.urbanize.at/" target="_blank">urbanize! 2021</a>
                    <a href="https://2020.urbanize.at/" target="_blank">urbanize! 2020</a>
                    <a href="https://2019.urbanize.at/" target="_blank">urbanize! 2019</a>
                    <a href="https://2018.urbanize.at/" target="_blank">ur9anize! 2018</a>
                    <a href="https://2017.urbanize.at/" target="_blank">ur8anize! 2017</a>
                    <a href="https://2016.urbanize.at/" target="_blank">urbani7e! 2016</a>
                    <a href="https://2015.urbanize.at/" target="_blank">ur6anize! 2015</a>
                    <a href="https://2014.urbanize.at/" target="_blank">ur5anize! 2014</a>
                    <a href="https://2013.urbanize.at/" target="_blank">ur4anize! 2013</a>
                    <a href="https://2012.urbanize.at/" target="_blank">ur3anize! 2012</a>
                    <a href="https://2011.urbanize.at/" target="_blank">urbani2e! 2011</a>
                </div>
            </details>
        </div>
        <div class="derive_mobile">
            ${DERIVE_INFO}
        </div>
    </footer>
`;
