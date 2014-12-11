using System;
using System.Collections.ObjectModel;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Diagnostics;

using Xamarin.Forms;

using ChartPerformance.ViewModels;
using ChartPerformance.Views;

namespace ChartPerformance.Pages
{
    public class MenuPage : ContentPage
    {

        readonly List<MenuItem> MenuItems = new List<MenuItem>();
        public ListView Menu { get; set; }

        public MenuPage(MasterDetailPage root)
        {
            // General
            Title = "Menü";
            Icon = Device.OS == TargetPlatform.iOS ? "menu.png" : null;

            BackgroundColor = Color.FromHex("FFFFFF");

            // Layout
            var layout = new StackLayout { Spacing = 0, VerticalOptions = LayoutOptions.FillAndExpand };

            // Menu title
            var menuLabel = new ContentView {
                Padding = new Thickness(10, 36, 0, 5),
                Content = new Xamarin.Forms.Label {
                    TextColor = Color.FromHex("AAAAAA"),
                    Text = "MENU", 
                }
            };

            Device.OnPlatform (
                iOS: () => ((Xamarin.Forms.Label)menuLabel.Content).Font = Font.SystemFontOfSize (NamedSize.Micro),
                Android: () => ((Xamarin.Forms.Label)menuLabel.Content).Font = Font.SystemFontOfSize (NamedSize.Medium)
            );

            layout.Children.Add(menuLabel);

            // Menu item list
            MenuItems.Add(new HorizontalTGPixiMenuItem());
            MenuItems.Add(new VerticalTGPixiMenuItem());
            MenuItems.Add(new BarChartPixiMenuItem());
            MenuItems.Add(new ColumnChartPixiMenuItem());
            MenuItems.Add(new StackedColumnChartPixiMenuItem());

            Menu = new ListView {
                ItemsSource = MenuItems,
                VerticalOptions = LayoutOptions.FillAndExpand,
                BackgroundColor = Color.Transparent
            };

            // Menu Cell
            var cell = new DataTemplate(typeof(DarkTextCell));
            cell.SetBinding(TextCell.TextProperty, "Title");
            cell.SetBinding(ImageCell.ImageSourceProperty, "IconSource");
            cell.SetValue(VisualElement.BackgroundColorProperty, Color.Transparent);
            Menu.ItemTemplate = cell;

            // Eventlistener on item
            Menu.ItemSelected += (sender, e) => {
                App.MDPage.Detail = NavigateTo(e.SelectedItem as MenuItem);
                App.MDPage.IsPresented = false;
            };
            layout.Children.Add(Menu);


            Content = layout;
        }

        /**
         * Creates Button for linking to its corresponding Page
         */
        private Page NavigateTo(MenuItem item)
        {
            return new NavPage(App.CreateContentPage(item.Title));
        }

    }
}

