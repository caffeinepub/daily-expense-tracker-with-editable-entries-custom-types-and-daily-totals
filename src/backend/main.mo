import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Expense module
  module Expense {
    public type ExpenseId = Nat;

    public type Expense = {
      id : Nat;
      submitterName : Text;
      expenseType : Text;
      amount : Nat;
      date : Time.Time;
      createdAt : Time.Time;
      updatedAt : Time.Time;
    };

    public type ExpenseInput = {
      submitterName : Text;
      expenseType : Text;
      amount : Nat;
      date : Time.Time;
    };

    public func create(id : Nat, input : ExpenseInput) : Expense {
      let currentTime = Time.now();
      {
        id;
        submitterName = input.submitterName;
        expenseType = input.expenseType;
        amount = input.amount;
        date = input.date;
        createdAt = currentTime;
        updatedAt = currentTime;
      };
    };

    public func update(existing : Expense, input : ExpenseInput) : Expense {
      {
        existing with
        submitterName = input.submitterName;
        expenseType = input.expenseType;
        amount = input.amount;
        date = input.date;
        updatedAt = Time.now();
      };
    };
  };

  var expenseIdCounter = 0;
  let expenses = Map.empty<Nat, Expense.Expense>();

  // Public expense functions - require user authentication
  public shared ({ caller }) func createExpense(input : Expense.ExpenseInput) : async Expense.Expense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create expenses");
    };

    let expenseId = expenseIdCounter;
    expenseIdCounter += 1;

    let expense = Expense.create(expenseId, input);
    expenses.add(expenseId, expense);
    expense;
  };

  public query ({ caller }) func getAllExpenses() : async [Expense.Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.values().toArray();
  };

  public shared ({ caller }) func updateExpense(id : Expense.ExpenseId, input : Expense.ExpenseInput) : async Expense.Expense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };

    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?existingExpense) {
        let updatedExpense = Expense.update(existingExpense, input);
        expenses.add(id, updatedExpense);
        updatedExpense;
      };
    };
  };

  public shared ({ caller }) func deleteExpense(id : Expense.ExpenseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };

    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?_existingExpense) {
        expenses.remove(id);
      };
    };
  };

  public query ({ caller }) func getDailyTotal(date : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense totals");
    };

    let nanosecondsPerDay : Int = (24 : Int) * (60 : Int) * (60 : Int) * (1_000_000_000 : Int);

    let dayStart = date / nanosecondsPerDay * nanosecondsPerDay;
    let dayEnd = dayStart + nanosecondsPerDay;

    let expensesForDay = expenses.values().toArray().filter(
      func(expense) {
        expense.date >= dayStart and expense.date < dayEnd
      }
    );

    expensesForDay.foldLeft(0, func(acc, expense) { acc + expense.amount });
  };

  /// Returns all expenses within a specified date range (inclusive).
  public query ({ caller }) func getExpensesInRange(startDate : Time.Time, endDate : Time.Time) : async [Expense.Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };

    expenses.values().toArray().filter(
      func(expense) {
        expense.date >= startDate and expense.date <= endDate
      }
    );
  };

  /// Returns the total expense amount for the current month up to now.
  public query ({ caller }) func getMonthlyTotalToNow() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense totals");
    };

    let currentTimeNs = Time.now();
    let nanosecondsPerDay : Int = (24 : Int) * (60 : Int) * (60 : Int) * (1_000_000_000 : Int);

    // Calculate current year and month
    let timestampSec = currentTimeNs / 1_000_000_000;
    let daysSinceEpoch = timestampSec / (24 * 3600);
    let daysInCurrentYear = daysSinceEpoch % 365;
    let currentMonth = ((daysInCurrentYear / 30) % 12) + 1;

    // Calculate start of current month in nanoseconds
    let daysInPreviousMonths = (currentMonth - 1) * 30;
    let startOfMonthTimeDays = daysInPreviousMonths + daysSinceEpoch - daysInCurrentYear;
    let startOfMonthTimeNs = startOfMonthTimeDays * nanosecondsPerDay;

    let expensesForMonth = expenses.values().toArray().filter(
      func(expense) {
        expense.date >= startOfMonthTimeNs and expense.date <= currentTimeNs
      }
    );

    expensesForMonth.foldLeft(0, func(acc, expense) { acc + expense.amount });
  };

  /// Returns the total expense amount from the earliest recorded expense year up to the current year.
  public query ({ caller }) func getAllYearsTotalToNow() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense totals");
    };

    let expensesArray = expenses.values().toArray();
    let total = expensesArray.foldLeft(0, func(acc, expense) { acc + expense.amount });
    total;
  };

  /// Returns the total expense amount for the current year up to now.
  public query ({ caller }) func getYearlyTotalToNow() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense totals");
    };

    let currentTimeNs = Time.now();
    let nanosecondsPerDay : Int = (24 : Int) * (60 : Int) * (60 : Int) * (1_000_000_000 : Int);
    let nanosecondsPerYear : Int = (365 : Int) * nanosecondsPerDay;

    // Calculate start of current year in nanoseconds
    let startOfYearTimeNs = currentTimeNs / nanosecondsPerYear * nanosecondsPerYear;

    let expensesForYear = expenses.values().toArray().filter(
      func(expense) {
        expense.date >= startOfYearTimeNs and expense.date <= currentTimeNs
      }
    );

    expensesForYear.foldLeft(0, func(acc, expense) { acc + expense.amount });
  };
};
