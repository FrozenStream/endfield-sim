class EnumMachineLevel {
  public readonly type:string;
  constructor(type:string) {
    this.type = type;
  }

  static readonly BASIC: EnumMachineLevel = new EnumMachineLevel('basic');
  static readonly ADVANCED: EnumMachineLevel = new EnumMachineLevel('advanced');
  static readonly STORAGE: EnumMachineLevel = new EnumMachineLevel('storage');
  static readonly ELECTRIC: EnumMachineLevel = new EnumMachineLevel('electric');
}


export default EnumMachineLevel;