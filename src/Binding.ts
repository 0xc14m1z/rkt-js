export enum BindingType {
  Number,
  String,
}

export type BindingValueType<T extends BindingType> = T extends BindingType.Number
  ? number
  : T extends BindingType.String
    ? string
    : never;

export abstract class Binding<T extends BindingType> {
  protected constructor(
    readonly type: T,
    readonly value: BindingValueType<T>,
  ) {}
}

function ImmediateBinding<T extends BindingType>(type: T) {
  return class extends Binding<T> {
    constructor(value: BindingValueType<T>) {
      super(type, value);
    }
  };
}

export class NumberBinding extends ImmediateBinding(BindingType.Number) {}
export class StringBinding extends ImmediateBinding(BindingType.String) {}
