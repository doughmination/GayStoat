/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { BotCommand, CommandContext, replyEmbed } from '../utils/commandContext';
import { buildEmbed } from '../utils/embedBuilder';

interface ApiResponse {
    content: string;
    type: 'gender' | 'sexuality';
}

function normalizeTerm(term: string): string {
    let normalized = term.toLowerCase().trim();
    if (normalized.endsWith('ies')) {
        normalized = normalized.slice(0, -3) + 'y';
    } else if (normalized.endsWith('es')) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && normalized.length > 2) {
        const exceptions = ['trans', 'nonbinary', 'genderless', 'ageless'];
        if (!exceptions.includes(normalized)) {
            normalized = normalized.slice(0, -1);
        }
    }
    return normalized;
}

async function searchLgbtqTerm(term: string): Promise<ApiResponse | null> {
    const normalized = normalizeTerm(term);
    const apiURL = `https://api.girlsnetwork.dev/api/${encodeURIComponent(normalized)}`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            console.log(`[LGBTQ Search] API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data: ApiResponse = JSON.parse(await response.text()) as ApiResponse;
        return data;
    } catch (error) {
        console.error('[LGBTQ Search] Fetch error:', error);
        return null;
    }
}

const command: BotCommand = {
    name: 'lgbtqsearch',
    description: 'Search for definitions of LGBTQIA+ terms. Usage: !lgbtqsearch <term>',
    aliases: ['lgbtq', 'define'],

    async execute(ctx: CommandContext): Promise<void> {
        const searchTerm = ctx.args.join(' ').trim();

        if (!searchTerm) {
            await ctx.message.reply('Please provide a term to search. Usage: `!lgbtqsearch <term>`');
            return;
        }

        const termData = await searchLgbtqTerm(searchTerm);

        if (termData) {
            const categoryDisplay = termData.type.charAt(0).toUpperCase() + termData.type.slice(1);

            // Stoat embeds don't support fields, so we append them to the description
            const description = [
                termData.content,
                '',
                `**Category:** ${categoryDisplay}`,
                `**Source:** girlsnetwork.dev`,
            ].join('\n');

            const embed = buildEmbed({
                title: `🏳️‍🌈 Term: ${searchTerm}`,
                description,
                colour: 0x5865F2,
            });

            await replyEmbed(ctx, [embed]);
        } else {
            const embed = buildEmbed({
                title: 'Term Not Found 🔎',
                description: `Could not find a definition for **"${searchTerm}"** in the database.\nMissing information? [Open an issue on GitHub](https://github.com/Girls-Network/LGBT-API/issues)`,
                colour: 0xED4245,
            });

            await replyEmbed(ctx, [embed]);
        }
    },
};

export default command;
