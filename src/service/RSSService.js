import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export default class RssService {
    static async fetchRssFeed() {
        try {
            const response = await axios.get('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
            const parser = new XMLParser();
            const parsedData = parser.parse(response.data);
            return parsedData.rss.channel.item; 
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
            return [];
        }
    }
}
