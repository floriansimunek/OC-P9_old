/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);

			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.classList.contains("active-icon")).toBe(true);
		});

		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => b - a;
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});

		describe("When I click on eye icon", () => {
			test("Then modal should be open", () => {
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					}),
				);
				document.body.innerHTML = BillsUI({ data: bills });
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				const billsContainer = new Bills({
					document,
					onNavigate,
					firestore: null,
					bills,
					localStorage: window.localStorage,
				});

				const modal = screen.getByTestId("modaleFile");
				const iconEye = screen.getAllByTestId("icon-eye");
				const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye);
				iconEye.forEach((icon) => {
					icon.addEventListener("click", () => {
						handleClickIconEye(icon);
					});
				});
				userEvent.click(iconEye[0]);

				expect(handleClickIconEye).toHaveBeenCalled();
				setTimeout(() => {
					expect(modal).toHaveClass("show");
				}, 50);
			});
		});

		describe("When I click on the new bill button 'Nouvelle note de frais'", () => {
			test("Then I should be redirected to 'new bill' page", () => {
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					}),
				);
				document.body.innerHTML = BillsUI({ data: bills });
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				const billsContainer = new Bills({
					document,
					onNavigate,
					firestore: null,
					bills,
					localStorage: window.localStorage,
				});

				const buttonNewBill = screen.getByTestId("btn-new-bill");
				const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill());
				buttonNewBill.addEventListener("click", handleClickNewBill);
				userEvent.click(buttonNewBill);

				expect(handleClickNewBill).toHaveBeenCalled();
				expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
			});
		});
	});
});
