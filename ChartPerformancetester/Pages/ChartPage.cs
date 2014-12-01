using System;
using Xamarin.Forms;
using ChartPerformancetester.Helpers;


namespace ChartPerformancetester
{
	public class ChartPage : NavigationPage
	{
		public ChartPage ()
		{
			Tint = Helpers.Color.Blue.ToFormsColor ();
			Title = "Chart Performance";
		
		}
	}
}

