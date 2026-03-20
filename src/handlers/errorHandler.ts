/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { Message } from 'revolt.js';
import { logError } from '../utils/logger';

export async function handleCommandError(
    error: Error | unknown,
    message: Message,
    commandName: string
): Promise<void> {
    logError(error, `Command: ${commandName}`);

    try {
        await message.reply('An error occurred while executing that command.');
    } catch (replyError) {
        logError(replyError, 'Error Handler Reply');
    }
}
