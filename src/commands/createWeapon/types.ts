export interface IWeaponXML {
    '@_file': string;
}

export interface IAllWeaponsXML {
    weapons: {
        weapon: IWeaponXML[];
    }
}