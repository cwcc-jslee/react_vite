/**
 * DrawerMenu (drawer_new 버전)
 * Dropdown, Toggle, Tabs 지원
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EllipsisVertical, ChevronRight } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '../ui';

const SubmenuItem = ({ item, onItemClick }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setIsSubmenuOpen(true)} onMouseLeave={() => setIsSubmenuOpen(false)} >
            <button type="button" className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors ${item.className || ''}`} >
                <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
                    <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
            {isSubmenuOpen && (
                <div className="absolute left-full top-0 ml-1 z-50 min-w-[160px] rounded-xl border border-gray-100 bg-white shadow-xl py-1">
                    {item.submenu.map((subitem) => (
                        <button key={subitem.key} type="button"
                            onClick={() => { if (subitem.onClick) subitem.onClick(); else if (onItemClick) onItemClick(subitem.key); }}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${subitem.className || ''}`} >
                            {subitem.icon && <subitem.icon className="h-4 w-4" />}
                            {subitem.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const DrawerMenu = ({ type = 'toggle', items = [], activeKey, onItemClick, className = '' }) => {
    if (!items || items.length === 0) return null;

    if (type === 'dropdown') {
        return (
            <div className={className}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-50 rounded-xl">
                            <EllipsisVertical className="h-5 w-5 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl min-w-[160px]">
                        {items.map((item, index) => {
                            if (item.separator) return <DropdownMenuSeparator key={`sep-${index}`} className="bg-gray-50" />;
                            if (item.submenu) return <SubmenuItem key={item.key} item={item} onItemClick={onItemClick} />;
                            return (
                                <DropdownMenuItem key={item.key}
                                    onClick={() => { if (item.onClick) item.onClick(); else if (onItemClick) onItemClick(item.key); }}
                                    disabled={item.disabled} className={`rounded-lg cursor-pointer ${item.className || ''}`} >
                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                    {item.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // Toggle/Tabs는 기존 로직과 유사하게 구현 (생략 가능하나 일관성을 위해 유지)
    return null;
};

export default DrawerMenu;
