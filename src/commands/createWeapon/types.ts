export interface IWeaponRegisterXML {
    '@_file': string;
}

export interface IAllWeaponsRegisterXML {
    weapons: {
        weapon: IWeaponRegisterXML[];
    }
}

export interface IWeaponXML {
    weapon: {
        '@_key': string;
    }
}