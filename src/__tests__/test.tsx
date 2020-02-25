import React from "react";
import { mount } from "enzyme";

import ModalController, { createModal } from "../index";

const Modal = ({ open, resolve, reject, value }: any) => {
  if (!open) return null;

  return (
    <div id="test">
      Test Modal
      <button id="cancel" onClick={() => reject()}>
        close
      </button>
      <button id="success" onClick={() => resolve(value)}>
        submit
      </button>
    </div>
  );
};

const sleep = (time: number = 100) => new Promise(res => setTimeout(res, time));

describe("simple render suite", () => {
  const controller = mount(<ModalController />);
  const factory = controller.children();
  const testModal = createModal(Modal, { enterTimeout: 10, exitTimeout: 10 });

  it("return correct value", async () => {
    testModal({ value: "modal_one_value" }).then(val => {
      expect(val).toBe("modal_one_value");
    });
  });

  it("mount first", async () => {
    controller.update();
    factory.update();

    await sleep(10);

    expect(factory.state().hashStack.length).toEqual(1);
    expect(factory.render().find("#test").length).toBe(1);
  });

  it("pass correct props to component", async () => {
    expect(
      factory
        .update()
        .find(Modal)
        .props().value
    ).toBe("modal_one_value");
    expect(
      factory
        .update()
        .find(Modal)
        .props().enterTimeout
    ).toBe(10);
  });

  it("mount second", async () => {
    testModal({ value: "modal_two_value" }).then(val => {
      expect(val).toBe(undefined);
    });

    controller.update();
    factory.update();

    await sleep(10);

    expect(factory.state().hashStack.length).toEqual(2);
    expect(factory.render().find("#test").length).toBe(2);
  });

  it("unmount first", async () => {
    // simulate click
    factory
      .update()
      .find(Modal)
      .at(1)
      .find("#success")
      .simulate("click");

    await sleep(10);

    controller.update();
    factory.update();

    expect(factory.state().hashStack.length).toEqual(1);
    expect(factory.render().find("#test").length).toBe(1);
  });

  it("unmount second", async () => {
    factory
      .update()
      .find(Modal)
      .find("#cancel")
      .simulate("click");

    await sleep(10);

    controller.update();
    factory.update();

    expect(factory.state().hashStack.length).toEqual(0);
    expect(factory.render().find("#test").length).toBe(0);
  });
});

describe("scope render suite", () => {
  const scopeController = mount(<ModalController scope="my_scope" />);
  const scopeFactory = scopeController.children();
  const scopeModal = createModal(Modal, {
    scope: "my_scope",
    enterTimeout: 10,
    exitTimeout: 10
  });

  it("render in scope", async () => {
    const scoped = scopeModal();

    scopeController.update();
    scopeFactory.update();

    await sleep(10);

    expect(scopeFactory.state().hashStack.length).toEqual(1);
    expect(scopeFactory.render().find("#test").length).toBe(1);
  });
});
