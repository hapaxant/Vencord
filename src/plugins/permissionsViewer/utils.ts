/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { classNameFactory } from "@api/Styles";
import { wordsToTitle } from "@utils/text";
import { i18n, Parser } from "@webpack/common";
import { Guild, GuildMember, Role } from "discord-types/general";
import type { ReactNode } from "react";

import { PermissionsSortOrder, settings } from ".";

export const cl = classNameFactory("vc-permviewer-");

function formatPermissionWithoutMatchingString(permission: string) {
    return wordsToTitle(permission.toLowerCase().split("_"));
}

// because discord is unable to be consistent with their names
const PermissionKeyMap = {
    MANAGE_GUILD: "MANAGE_SERVER",
    MANAGE_GUILD_EXPRESSIONS: "MANAGE_EXPRESSIONS",
    CREATE_GUILD_EXPRESSIONS: "CREATE_EXPRESSIONS",
    MODERATE_MEMBERS: "MODERATE_MEMBER", // HELLOOOO ??????
    STREAM: "VIDEO",
    SEND_VOICE_MESSAGES: "ROLE_PERMISSIONS_SEND_VOICE_MESSAGE",
} as const;

export function getPermissionString(permission: string) {
    permission = PermissionKeyMap[permission] || permission;

    return i18n.Messages[permission] ||
        // shouldn't get here but just in case
        formatPermissionWithoutMatchingString(permission);
}

export function getPermissionDescription(permission: string): ReactNode {
    // DISCORD PLEEEEEEEEAAAAASE IM BEGGING YOU :(
    if (permission === "USE_APPLICATION_COMMANDS")
        permission = "USE_APPLICATION_COMMANDS_GUILD";
    else if (permission === "SEND_VOICE_MESSAGES")
        permission = "SEND_VOICE_MESSAGE_GUILD";
    else if (permission !== "STREAM")
        permission = PermissionKeyMap[permission] || permission;

    const msg = i18n.Messages[`ROLE_PERMISSIONS_${permission}_DESCRIPTION`] as any;
    if (msg?.hasMarkdown)
        return Parser.parse(msg.message);

    if (typeof msg === "string") return msg;

    return "";
}

export function getSortedRoles({ roles, id }: Guild, member: GuildMember) {
    return [...member.roles, id]
        .map(id => roles[id])
        .sort((a, b) => b.position - a.position);
}

export function sortUserRoles(roles: Role[]) {
    switch (settings.store.permissionsSortOrder) {
        case PermissionsSortOrder.HighestRole:
            return roles.sort((a, b) => b.position - a.position);
        case PermissionsSortOrder.LowestRole:
            return roles.sort((a, b) => a.position - b.position);
        default:
            return roles;
    }
}
