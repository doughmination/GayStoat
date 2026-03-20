/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { Client } from 'revolt.js';
import { loadCommands } from './handlers/commandHandler';
import { processReactionQueue } from './utils/reactionSystem';
import { logBoot, log, logError } from './utils/logger';
import messageCreateEvent from './events/messageCreate';
import chalk from 'chalk';

// ── Types ──────────────────────────────────────────────────────────────────

interface ReactionQueueEntry {
    message: any;
    emoji: string;
}

interface ExtendedClient extends Client {
    commands: Map<any, any>;
    reactionQueue: ReactionQueueEntry[];
}

// ── Client setup ────────────────────────────────────────────────────────────

const client = new Client() as ExtendedClient;
client.reactionQueue = [];

// ── Events ──────────────────────────────────────────────────────────────────

client.on('ready', () => {
    log(chalk.greenBright(`Logged in as ${client.user?.username}! (GayStoat / Doughmination)`));
    // Stoat bots cannot set a guild banner via the bot API — omitted.
});

client.on('messageCreate', (message) => {
    messageCreateEvent.execute(message, client);
});

// ── Reaction queue processor ─────────────────────────────────────────────────

setInterval(() => processReactionQueue(client.reactionQueue), 1000);

// ── Startup ──────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
    logBoot();

    const token = process.env.GAYBOT_TOKEN;
    if (!token || token === 'your_bot_token_here') {
        logError(new Error('GAYBOT_TOKEN is not set'), 'Startup');
        process.exit(1);
    }

    await loadCommands(client);
    await client.loginBot(token);
}

start().catch(err => {
    logError(err, 'Startup');
    process.exit(1);
});
