const changeTheme = function () {
    const body = document.querySelector('body');
    const icon = document.querySelector('.fa-moon');

    const theme = body.dataset.theme === 'light' ? 'dark' : 'light';

    if (theme === 'light') {
        icon.classList.replace('fa-solid', 'fa-regular');
    } else {
        icon.classList.replace('fa-regular', 'fa-solid');
    };

    body.dataset.theme = theme;
};

const btnToggle = document.querySelector('.navbar__toggle--btn');
btnToggle.addEventListener('click', changeTheme);

class App {
    #countries = [];
    #country = {};
    #countriesSec = document.querySelector('.countries');
    #countryDetails = document.querySelector('.country');
    #countriesContainer = document.querySelector('.countries__container');
    #countryContent = document.querySelector('.country__content');
    #searchForm = document.querySelector('.search__form');
    #filterBtn = document.querySelector('.filter__btn');
    #filterRegions = document.querySelector('.filter__regions');

    constructor() {
        this.clear();

        this.#filterBtn.addEventListener('click', this._toggleFilter.bind(this));
        this.#filterRegions.addEventListener('click', this._filterCountries.bind(this));
        this.#searchForm.addEventListener('submit', this._searchCountry.bind(this));

        window.addEventListener('hashchange', this._handleHashChange.bind(this));
        window.addEventListener('load', this._handleHashChange.bind(this));
    };

    clear() {
        this.#countriesContainer.innerHTML = '';
        this.#countryContent.innerHTML = '';
        this.#countriesSec.classList.add('disabled');
        this.#countryDetails.classList.add('disabled');
    };

    async _loadCountries(api) {
        const res = await fetch(api);
        if (!res.ok) return;

        const data = await res.json();
        this.#countries = data;

        this._renderCountries(this.#countries);
    };

    _renderCountries(countries) {
        this.#countriesContainer.innerHTML = '';
        this.#countryDetails.classList.add('disabled');
        this.#countriesSec.classList.remove('disabled');

        if (!countries.length) this.#countriesContainer.insertAdjacentHTML('beforeend', '<h1>No country found :(</h1>');

        countries.forEach(country => {
            const card = this._createCountryCard(country);

            this.#countriesContainer.insertAdjacentHTML('beforeend', card);
        });
    };

    _createCountryCard(country) {
        const {
            name: {
                common
            },
            population,
            region,
            capital,
            flags: {
                svg
            },
            cioc
        } = country;

        const html = `
        <a href="#${cioc}" class="countries__card">
            <div class="countries__flag">
                <img src="${svg}" alt="${common}">
            </div>
            <div class="countries__body">
                <h2>${common}</h2>
                <h3>Population: <span>${population}</span></h3>
                <h3>Region: <span>${region}</span></h3>
                ${capital ? `<h3>Capital: <span>${capital}</span></h3>` : ''}
            </div>
        </a>
        `;

        return html;
    };

    _toggleFilter() {
        this.#filterBtn.classList.toggle('active');
    };

    _filterCountries(e) {
        const {
            region
        } = e.target.dataset;
        if (!region) return;
        let filtered = this.#countries;

        if (!(region === 'all')) {
            filtered = this.#countries.filter(country => country.region === region);
        };

        this._renderCountries(filtered);
        this._toggleFilter();
    };

    _searchCountry(e) {
        e.preventDefault();
        const country = e.target.country.value;

        if (!country) {
            this._loadCountries('https://restcountries.com/v3.1/all');
            return;
        };

        this._loadCountries(`https://restcountries.com/v3.1/name/${country}`);
    };

    _handleHashChange() {
        const countryCode = window.location.hash.slice(1);

        if (!countryCode) {
            this._loadCountries('https://restcountries.com/v3.1/all');
            return;
        };

        this._loadCountry(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    };

    async _loadCountry(api) {
        const res = await fetch(api);
        const data = await res.json();
        this.#country = data[0];

        this._renderCountryDetail();
    };

    async _renderCountryDetail() {
        this.#countryContent.innerHTML = '';
        this.#countriesSec.classList.add('disabled');
        this.#countryDetails.classList.remove('disabled');

        const {
            name: {
                common,
                nativeName
            },
            population,
            region,
            subregion,
            capital,
            flags: {
                svg
            },
            tld,
            currencies,
            languages,
            borders
        } = this.#country;

        const native = nativeName[Object.keys(nativeName)[0]].common;
        const currency = currencies[Object.keys(currencies)[0]].name;
        const language = Object.values(languages).join(', ');

        const borderElms = await this._generateBorderElms(borders);

        const html = `
        <div class="country__flag">
            <img src="${svg}" alt="${common}">
        </div>
        <div class="country__data">
            <h2>${common}</h2>
            <div class="country__row">
                <div class="country__col">
                    <h3>Native Name: <span>${native}</span></h3>
                    <h3>Population: <span>${population}</span></h3>
                    <h3>Region: <span>${region}</span></h3>
                    <h3>Sub Region: <span>${subregion}</span></h3>
                    ${capital ? `<h3>Capital: <span>${capital}</span></h3>` : ''}
                </div>
                <div class="country__col">
                    <h3>Top Level Domain: <span>${tld}</span></h3>
                    <h3>Currencies: <span>${currency}</span></h3>
                    <h3>Languages: <span>${language}</span></h3>
                </div>
            </div>
            <div class="country__borders">
                <h3>Border Countries: </h3>
                <ul>
                    ${borderElms}
                </ul>
            </div>
        </div>
        `;

        this.#countryContent.insertAdjacentHTML('beforeend', html);
    };

    async _generateBorderElms(countryCodes) {
        if (!countryCodes) return 'There is no border country';

        const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${countryCodes}`);
        const borders = await res.json();

        return borders
            .map(border => `<li><a href="#${border.cioc}">${border.name.common}</a></li>`)
            .join('');
    };
};

const app = new App();