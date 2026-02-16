


class EnumMachineLevel {
  public readonly type:string;
  constructor(type:string) {
    this.type = type;
  }

  static readonly BASIC: EnumMachineLevel = new EnumMachineLevel('basic');
  static readonly ADVANCED: EnumMachineLevel = new EnumMachineLevel('advanced');
  static readonly WAREHOUSE: EnumMachineLevel = new EnumMachineLevel('warehouse');
  static readonly ELECTRIC: EnumMachineLevel = new EnumMachineLevel('electric');
}