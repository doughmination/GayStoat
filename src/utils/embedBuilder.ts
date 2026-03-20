/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 *
 * Stoat (Revolt) does not have an EmbedBuilder class.
 * Embeds are plain SendableEmbed objects sent inside the `embeds` array of a message.
 * Docs: https://developers.revolt.chat/api/#tag/Messaging
 *
 * SendableEmbed shape:
 *   icon_url?  : string
 *   url?       : string
 *   title?     : string
 *   description?: string
 *   media?     : string  (autumn file ID)
 *   colour?    : string  (hex string e.g. "#8e44ad")
 */

export interface StoatEmbed {
    icon_url?: string;
    url?: string;
    title?: string;
    description?: string;
    media?: string;
    colour?: string;
}

/**
 * Convert a numeric colour (like 0x8e44ad) to a hex string Stoat expects.
 */
export function hexColour(colour: number): string {
    return `#${colour.toString(16).padStart(6, '0')}`;
}

/**
 * Lightweight builder so commands stay readable.
 * Returns a plain StoatEmbed object — no class overhead.
 */
export function buildEmbed(opts: {
    title?: string;
    description?: string;
    colour?: number;
    iconUrl?: string;
    url?: string;
}): StoatEmbed {
    const embed: StoatEmbed = {};
    if (opts.title)       embed.title       = opts.title;
    if (opts.description) embed.description = opts.description;
    if (opts.colour)      embed.colour      = hexColour(opts.colour);
    if (opts.iconUrl)     embed.icon_url    = opts.iconUrl;
    if (opts.url)         embed.url         = opts.url;
    return embed;
}
