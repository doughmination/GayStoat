/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'revolt.js';
import { BotCommand } from '../utils/commandContext';
import { log, logError } from '../utils/logger';
import chalk from 'chalk';

interface ExtendedClient extends Client {
    commands: Map<string, BotCommand>;
}

export async function loadCommands(client: ExtendedClient): Promise<void> {
    (client as any).commands = new Map<string, BotCommand>();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath)
        .filter(f => f.endsWith('.js') || f.endsWith('.ts'));

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const mod = require(filePath);
            const command: BotCommand = mod.default ?? mod;

            if (command?.name && typeof command.execute === 'function') {
                (client as any).commands.set(command.name.toLowerCase(), command);

                // Register aliases too
                command.aliases?.forEach(alias => {
                    (client as any).commands.set(alias.toLowerCase(), command);
                });
            }
        } catch (err) {
            logError(err, `Loading command ${file}`);
        }
    }

    log(chalk.cyanBright(`Loaded ${(client as any).commands.size} command(s)`));
}
