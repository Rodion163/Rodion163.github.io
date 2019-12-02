import "./styles/analytics.css";
import { CachedNewsApi } from "./newsApi";
import { NEWS_TOKEN, NEWS_URL } from "./config";
import { formatDateISO } from "./formatDate";
import { formatDateShort } from "./formatDate";
import { createElement } from "./createElement";
function countWords(str, word) {
    let count = 0;
    str.toLowerCase().replace(new RegExp(word.toLowerCase(), 'g'), () => count++)
    return count
}

function calculateAnalytics(articles, word) {
    const hashCount = {};
    articles.forEach(article => {
        const dateKey = formatDateISO(new Date(article.publishedAt));
        if (!hashCount[dateKey]) {
            hashCount[dateKey] = 0;
        }
        hashCount[dateKey] += countWords(article.title, word);
        hashCount[dateKey] += countWords(article.description, word);
    });
    const datesList = Object.keys(hashCount);
    const sortedDatesList = datesList.sort((a, b) => new Date(a) - new Date(b))
    return sortedDatesList.map(date => ({ date, count: hashCount[date] }))
}


class Analytics {
    constructor(searchTextPlaceholder, chart, searchText, totalnText, totalOnWeek) {
        this.totalnText = totalnText;
        this.totalOnWeek = totalOnWeek;
        this.searchTextPlaceholder = searchTextPlaceholder;
        this.chart = chart;
        this.searchText = searchText;
        this.api = new CachedNewsApi(NEWS_URL, NEWS_TOKEN);
        this.scale = chart.querySelector(".chart__scale_bottom");
        this.create()
    }
    create() {
        this.searchTextPlaceholder.innerText = this.searchText;

        this.api.load(this.searchText).then(result => {
            const statistic = calculateAnalytics(result.articles, this.searchText);
            let sum = 0;
            statistic.forEach(entry => {
                sum += entry.count;
            })
            this.totalnText.innerText = sum;
            this.totalOnWeek.innerText = result.articles.length;
            statistic.forEach(entry => {
                const dateElem = createElement("div", ["chart__content-date"]);
                dateElem.innerText = formatDateShort(new Date(entry.date));
                const valueElem = createElement("div", ["chart__content-value"]);
                const barElem = createElement("div", ["chart__content-value-bar"]);
                valueElem.appendChild(barElem);
                barElem.innerText = entry.count;
                barElem.setAttribute("style", `width: ${entry.count / sum * 100}%`);
                chart.insertBefore(dateElem, this.scale);
                chart.insertBefore(valueElem, this.scale);

            })
        })

    }
}

const searchTextPlaceholder = document.querySelector('#searchText');
const chart = document.querySelector('.chart');
const currentUrl = new URL(location.href);
const searchText = currentUrl.searchParams.get('search');
const totalnText = document.querySelector('#totalInText');
const totalOnWeek = document.querySelector('#totalOnWeek');
new Analytics(searchTextPlaceholder, chart, searchText, totalnText, totalOnWeek);