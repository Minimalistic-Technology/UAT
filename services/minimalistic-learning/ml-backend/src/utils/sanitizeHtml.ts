import sanitizeHtml from 'sanitize-html';
import { ApiError } from './ApiError';
import { StatusCodes } from 'http-status-codes';

export const cleanHtml = (dirty: string) => {
    if (!dirty) return dirty;


    // Pass the remaining safe content through the standard sanitize-html engine
    return sanitizeHtml(dirty, {
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span', 'u'
        ],
        allowedAttributes: {
            'a': ['href', 'name', 'target', 'rel'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'code': ['class'],
            'span': ['style'],
            'p': ['style', 'class'],
            '*': ['class', 'id', 'style']
        },
        allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https', 'data']
        },
        allowProtocolRelative: true,
        enforceHtmlBoundary: true
    });
};
